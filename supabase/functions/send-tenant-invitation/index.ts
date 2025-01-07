import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, propertyId, propertyName, startDate, endDate, firstName, lastName, token } = await req.json()

    // Create the invitation URL
    const inviteUrl = `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '.lovableproject.com')}/auth?invitation=${token}`

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      },
      body: JSON.stringify({
        from: 'PropertyHub <onboarding@resend.dev>',
        to: email,
        subject: 'Invitation to PropertyHub',
        html: `
          <h2>Welcome to PropertyHub!</h2>
          <p>You have been invited to join PropertyHub as a tenant for ${propertyName}.</p>
          <p>Your tenancy details:</p>
          <ul>
            <li>Start Date: ${startDate}</li>
            ${endDate ? `<li>End Date: ${endDate}</li>` : ''}
          </ul>
          <p>To accept this invitation and create your account, please click the link below:</p>
          <a href="${inviteUrl}" style="display: inline-block; background-color: #0F172A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Accept Invitation</a>
          <p>This invitation link will expire in 7 days.</p>
        `,
      }),
    })

    if (!res.ok) {
      throw new Error('Failed to send email')
    }

    return new Response(
      JSON.stringify({ message: 'Invitation sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})