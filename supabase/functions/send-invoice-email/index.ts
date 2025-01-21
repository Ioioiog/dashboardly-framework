import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  invoiceId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured');
      throw new Error('RESEND_API_KEY is not configured');
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Supabase credentials are not configured');
      throw new Error('Supabase credentials are not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { invoiceId }: EmailRequest = await req.json();

    console.log('Starting invoice email process for ID:', invoiceId);

    // First, get the invoice with all related data
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select(`
        *,
        tenant:profiles!invoices_tenant_id_fkey (
          email,
          first_name,
          last_name
        ),
        property:properties (
          name,
          address
        ),
        landlord:profiles!invoices_landlord_id_fkey (
          first_name,
          last_name,
          invoice_info
        ),
        items:invoice_items (
          description,
          amount,
          type
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      throw new Error(`Failed to fetch invoice: ${invoiceError.message}`);
    }

    if (!invoice) {
      console.error('No invoice found for ID:', invoiceId);
      throw new Error('Invoice not found');
    }

    if (!invoice.tenant?.email) {
      console.error('No tenant email found for invoice:', invoiceId);
      throw new Error('Tenant email not found');
    }

    console.log('Retrieved invoice data:', {
      invoiceId,
      tenant: invoice.tenant,
      property: invoice.property,
      items: invoice.items
    });

    // Format the items for email
    const itemsList = invoice.items
      ?.map(item => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.description}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${item.amount.toFixed(2)}</td>
        </tr>
      `)
      .join('') || '';

    // Format the email content with better styling
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2d3748;">Invoice for ${invoice.property.name}</h2>
        
        <p>Dear ${invoice.tenant.first_name || ''} ${invoice.tenant.last_name || ''},</p>
        
        <div style="background-color: #f7fafc; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Property Details</h3>
          <p style="margin: 5px 0;">
            <strong>Property:</strong> ${invoice.property.name}<br>
            <strong>Address:</strong> ${invoice.property.address}<br>
            <strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}<br>
            <strong>Status:</strong> ${invoice.status}
          </p>
        </div>

        <h3>Invoice Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #edf2f7;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Description</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
            <tr style="font-weight: bold; background-color: #f7fafc;">
              <td style="padding: 8px; border: 1px solid #ddd;">Total Amount</td>
              <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">$${invoice.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <p style="color: #e53e3e; margin: 20px 0;">Please ensure payment is made by the due date.</p>
        
        <p style="margin-top: 30px;">
          Best regards,<br>
          ${invoice.landlord.first_name || ''} ${invoice.landlord.last_name || ''}
        </p>
      </div>
    `;

    // Get sender email from landlord's invoice info or use default
    const fromEmail = invoice.landlord.invoice_info?.email || 'onboarding@resend.dev';
    console.log('Sending email from:', fromEmail);

    // Send email using Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [invoice.tenant.email],
        subject: `Invoice for ${invoice.property.name}`,
        html: emailHtml,
      }),
    });

    const responseData = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error('Resend API error:', responseData);
      throw new Error(`Failed to send email: ${JSON.stringify(responseData)}`);
    }

    console.log('Email sent successfully:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Error in send-invoice-email function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error
      }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

serve(handler);