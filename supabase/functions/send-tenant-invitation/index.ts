import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

console.log("Hello from send-tenant-invitation!")

serve(async (req) => {
  try {
    // Enable CORS
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        }
      })
    }

    // Get the request body
    const { email, propertyId, propertyName, startDate, endDate, firstName, lastName, token } = await req.json()

    // Create the invitation URL
    const inviteUrl = `https://app.lovableproject.com/tenant-registration?invitation=${token}`

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PropertyHub <onboarding@resend.dev>',
        to: email,
        subject: 'Invitation to Join PropertyHub',
        html: `
          <h2>Welcome to PropertyHub!</h2>
          <p>You've been invited to join ${propertyName} as a tenant.</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          ${endDate ? `<p><strong>End Date:</strong> ${endDate}</p>` : ''}
          <p>Click the link below to create your account and accept the invitation:</p>
          <p><a href="${inviteUrl}">Accept Invitation</a></p>
          <p>If you didn't expect this invitation, you can ignore this email.</p>
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})