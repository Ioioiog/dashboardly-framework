import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Property {
  name: string;
  address: string;
}

interface InvitationRequest {
  email: string;
  firstName: string;
  lastName: string;
  properties: Property[];
  token: string;
  startDate: string;
  endDate?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('Missing RESEND_API_KEY environment variable');
      throw new Error('Missing RESEND_API_KEY environment variable');
    }

    const requestData: InvitationRequest = await req.json();
    const { email, firstName, lastName, properties, token, startDate, endDate } = requestData;
    
    console.log('Processing invitation request:', {
      email,
      firstName,
      lastName,
      propertiesCount: properties.length,
      token,
      startDate,
      endDate
    });

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);
    
    // Use the correct domain in the invitation URL
    const inviteUrl = `${req.headers.get('origin')}/tenant-registration?invitation=${token}`;

    console.log('Sending invitation email to:', email);
    console.log('Using invite URL:', inviteUrl);

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: 'Admin Chirii <noreply@adminchirii.ro>',
      to: [email],
      subject: 'Invitation to Join Property Management Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0F172A;">Welcome to Admin Chirii</h2>
          <p>Hello ${firstName || ''} ${lastName || ''},</p>
          <p>You have been invited to join our property management platform for the following properties:</p>
          ${properties.map(property => `
            <div style="margin-bottom: 10px; padding: 10px; background-color: #f8fafc; border-radius: 4px;">
              <strong>${property.name}</strong><br/>
              ${property.address}
            </div>
          `).join('')}
          <div style="margin: 20px 0;">
            <h3 style="color: #334155;">Tenancy Details:</h3>
            <ul style="list-style: none; padding: 0;">
              <li style="margin-bottom: 5px;">📅 Start Date: ${new Date(startDate).toLocaleDateString()}</li>
              ${endDate ? `<li style="margin-bottom: 5px;">📅 End Date: ${new Date(endDate).toLocaleDateString()}</li>` : ''}
            </ul>
          </div>
          <p>Please click the button below to complete your registration:</p>
          <a href="${inviteUrl}" 
             style="display: inline-block; padding: 12px 24px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Complete Registration
          </a>
          <p style="color: #64748b; font-size: 14px;">This invitation will expire in 7 days.</p>
          <p style="color: #64748b; font-size: 14px;">If you have any questions, please contact your landlord.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px;">If you didn't expect this invitation, please ignore this email.</p>
        </div>
      `
    });

    if (emailError) {
      console.error('Failed to send email:', emailError);
      throw new Error('Failed to send invitation email');
    }

    console.log('Email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Invitation sent successfully',
      data: emailResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Error in send-tenant-invitation function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})