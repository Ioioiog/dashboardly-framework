import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  email: string;
  propertyId: string;
  propertyName: string;
  startDate: string;
  endDate?: string;
  firstName: string;
  lastName: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Received invitation request");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const invitation: InvitationRequest = await req.json();
    
    console.log("Processing invitation for:", invitation.email);

    // Generate a secure token
    const token = crypto.randomUUID();
    
    // Store the invitation details
    const { error: inviteError } = await supabase
      .from('tenant_invitations')
      .insert({
        token,
        email: invitation.email,
        property_id: invitation.propertyId,
        first_name: invitation.firstName,
        last_name: invitation.lastName,
        start_date: invitation.startDate,
        end_date: invitation.endDate,
        status: 'pending'
      });

    if (inviteError) {
      console.error("Error storing invitation:", inviteError);
      throw inviteError;
    }

    // Send the invitation email
    const inviteUrl = new URL(req.url);
    const baseUrl = `${inviteUrl.protocol}//${inviteUrl.host}`;
    const acceptUrl = `${baseUrl}/accept-invitation?token=${token}`;

    console.log("Sending email to:", invitation.email);
    
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Property Management <onboarding@resend.dev>",
        to: [invitation.email],
        subject: `Invitation to join ${invitation.propertyName} as a tenant`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb;">You've been invited!</h1>
            <p>Hello ${invitation.firstName},</p>
            <p>You've been invited to join <strong>${invitation.propertyName}</strong> as a tenant.</p>
            <p><strong>Tenancy details:</strong></p>
            <ul>
              <li>Start date: ${new Date(invitation.startDate).toLocaleDateString()}</li>
              ${invitation.endDate ? `<li>End date: ${new Date(invitation.endDate).toLocaleDateString()}</li>` : ''}
            </ul>
            <p>Click the button below to accept the invitation and set up your account:</p>
            <a href="${acceptUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Accept Invitation</a>
            <p style="color: #666;">This link will expire in 7 days.</p>
            <p style="color: #666; font-size: 12px;">If you didn't expect this invitation, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
    }

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error in send-tenant-invitation function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);