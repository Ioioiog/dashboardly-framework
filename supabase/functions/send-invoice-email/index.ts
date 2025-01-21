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
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const { invoiceId }: EmailRequest = await req.json();

    console.log('Fetching invoice details for ID:', invoiceId);

    // Get invoice details with related data
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
          email,
          first_name,
          last_name,
          invoice_info
        )
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError) throw invoiceError;
    if (!invoice) throw new Error('Invoice not found');

    console.log('Sending email for invoice:', invoice);

    // Format the email content
    const emailHtml = `
      <h2>Invoice for ${invoice.property.name}</h2>
      <p>Dear ${invoice.tenant.first_name} ${invoice.tenant.last_name},</p>
      <p>Please find below the details of your invoice:</p>
      <ul>
        <li><strong>Property:</strong> ${invoice.property.name} (${invoice.property.address})</li>
        <li><strong>Amount:</strong> $${invoice.amount}</li>
        <li><strong>Due Date:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</li>
        <li><strong>Status:</strong> ${invoice.status}</li>
      </ul>
      <p>Please ensure payment is made by the due date.</p>
      <p>Best regards,<br>${invoice.landlord.first_name} ${invoice.landlord.last_name}</p>
    `;

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: invoice.landlord.invoice_info?.email || 'onboarding@resend.dev',
        to: [invoice.tenant.email],
        subject: `Invoice for ${invoice.property.name}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in send-invoice-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
};

serve(handler);