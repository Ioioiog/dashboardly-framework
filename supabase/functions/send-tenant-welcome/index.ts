import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  firstName: string;
  propertyName: string;
  temporaryPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, firstName, propertyName, temporaryPassword }: WelcomeEmailRequest = await req.json();

    const emailHtml = `
      <h1>Welcome to PropertyHub!</h1>
      <p>Hello ${firstName},</p>
      <p>Your landlord has created an account for you for the property: ${propertyName}</p>
      <p>You can log in using these credentials:</p>
      <ul>
        <li>Email: ${email}</li>
        <li>Temporary Password: ${temporaryPassword}</li>
      </ul>
      <p><strong>Important:</strong> For security reasons, please change your password after your first login.</p>
      <p>Best regards,<br>PropertyHub Team</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "PropertyHub <onboarding@resend.dev>",
        to: [email],
        subject: "Welcome to PropertyHub - Your Account Details",
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);