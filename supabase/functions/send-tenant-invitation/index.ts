import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  email: string;
  propertyId: string;
  propertyName: string;
  startDate: string;
  endDate: string | null;
  firstName: string;
  lastName: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set');
      throw new Error('Email service configuration is missing');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase configuration is missing');
      throw new Error('Database configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const requestData: InvitationRequest = await req.json();
    console.log('Received invitation request:', requestData);

    // Generate a unique token for the invitation
    const token = crypto.randomUUID();
    console.log('Generated invitation token:', token);

    // Create the invitation record in the database
    const { data: invitation, error: invitationError } = await supabase
      .from('tenant_invitations')
      .insert({
        email: requestData.email,
        first_name: requestData.firstName,
        last_name: requestData.lastName,
        property_id: requestData.propertyId,
        token: token,
        start_date: requestData.startDate,
        end_date: requestData.endDate,
        status: 'pending'
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      throw new Error('Failed to create invitation');
    }

    console.log('Created invitation record:', invitation);

    // Use the preview URL for generating the invitation link
    const invitationUrl = `https://preview--dashboardly-framework.lovable.app/accept-invitation?token=${token}`;
    console.log('Generated invitation URL:', invitationUrl);

    // Send the email using Resend with improved HTML template
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Property Manager <onboarding@resend.dev>',
        to: [requestData.email],
        subject: `Invitation to join ${requestData.propertyName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .button { 
                  display: inline-block; 
                  padding: 12px 24px; 
                  background-color: #4F46E5; 
                  color: white; 
                  text-decoration: none; 
                  border-radius: 6px;
                  margin: 20px 0;
                }
                .details { 
                  background-color: #f9fafb; 
                  padding: 15px; 
                  border-radius: 6px;
                  margin: 15px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <h2>Welcome to Property Manager!</h2>
                <p>You have been invited to join ${requestData.propertyName} as a tenant.</p>
                
                <div class="details">
                  <h3>Your Tenancy Details:</h3>
                  <p><strong>Start Date:</strong> ${new Date(requestData.startDate).toLocaleDateString()}</p>
                  ${requestData.endDate ? `<p><strong>End Date:</strong> ${new Date(requestData.endDate).toLocaleDateString()}</p>` : ''}
                  <p><strong>Property:</strong> ${requestData.propertyName}</p>
                </div>

                <p>To accept this invitation and set up your account, please click the button below:</p>
                <a href="${invitationUrl}" class="button">Accept Invitation</a>

                <p><small>This invitation link will expire in 7 days. If you did not expect this invitation, please ignore this email.</small></p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error('Error sending email:', errorData);
      throw new Error('Failed to send invitation email');
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in send-tenant-invitation function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});