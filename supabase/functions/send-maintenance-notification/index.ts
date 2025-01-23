import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const { requestId, type } = await req.json();

    console.log(`Processing maintenance notification for request ${requestId}, type: ${type}`);

    // Fetch maintenance request details with related data
    const { data: request, error: requestError } = await supabase
      .from('maintenance_requests')
      .select(`
        *,
        property:properties(name),
        tenant:profiles!maintenance_requests_tenant_id_fkey(
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', requestId)
      .single();

    if (requestError) {
      console.error('Error fetching request:', requestError);
      throw requestError;
    }

    if (!request?.tenant?.email) {
      console.error('No tenant email found for request:', requestId);
      throw new Error('Tenant email not found');
    }

    console.log('Sending email to tenant:', request.tenant.email);

    let subject = '';
    let content = '';

    switch (type) {
      case 'status_update':
        subject = `Maintenance Request Status Updated - ${request.property.name}`;
        content = `
          <h2>Maintenance Request Update</h2>
          <p>The status of your maintenance request has been updated:</p>
          <ul>
            <li>Property: ${request.property.name}</li>
            <li>Issue: ${request.title}</li>
            <li>New Status: ${request.status}</li>
          </ul>
          ${request.notes ? `<p>Notes: ${request.notes}</p>` : ''}
        `;
        break;

      case 'new_request':
        subject = `New Maintenance Request Created - ${request.property.name}`;
        content = `
          <h2>New Maintenance Request</h2>
          <p>A new maintenance request has been created:</p>
          <ul>
            <li>Property: ${request.property.name}</li>
            <li>Issue: ${request.title}</li>
            <li>Priority: ${request.priority}</li>
            <li>Description: ${request.description}</li>
          </ul>
        `;
        break;

      default:
        throw new Error('Invalid notification type');
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Property Management <onboarding@resend.dev>',
        to: request.tenant.email,
        subject: subject,
        html: content,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }

    console.log('Email sent successfully');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-maintenance-notification:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});