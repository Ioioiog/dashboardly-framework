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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const invitation: InvitationRequest = await req.json();

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
      throw inviteError;
    }

    // Send the invitation email
    const inviteUrl = new URL(req.url);
    const baseUrl = `${inviteUrl.protocol}//${inviteUrl.host}`;
    const acceptUrl = `${baseUrl}/accept-invitation?token=${token}`;

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
          <h1>You've been invited!</h1>
          <p>Hello ${invitation.firstName},</p>
          <p>You've been invited to join ${invitation.propertyName} as a tenant.</p>
          <p>Tenancy details:</p>
          <ul>
            <li>Start date: ${new Date(invitation.startDate).toLocaleDateString()}</li>
            ${invitation.endDate ? `<li>End date: ${new Date(invitation.endDate).toLocaleDateString()}</li>` : ''}
          </ul>
          <p>Click the link below to accept the invitation and set up your account:</p>
          <a href="${acceptUrl}">Accept Invitation</a>
          <p>This link will expire in 7 days.</p>
        `,
      }),
    });

    if (!res.ok) {
      throw new Error("Failed to send email");
    }

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