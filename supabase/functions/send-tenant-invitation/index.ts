import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

console.log("Tenant invitation function started!")

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("Processing invitation request")
    
    // Get the request body
    const { email, propertyId, token, startDate, endDate, firstName, lastName } = await req.json()
    
    console.log("Request data:", { email, propertyId, startDate, endDate, firstName, lastName })

    // Create the invitation URL
    const inviteUrl = `${req.headers.get('origin')}/tenant-registration?invitation=${token}`
    
    console.log("Generated invite URL:", inviteUrl)

    // Verify RESEND_API_KEY exists
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    // Get property details from Supabase
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('name')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      throw new Error('Failed to fetch property details')
    }

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PropertyHub <onboarding@resend.dev>',
        to: email,
        subject: 'Invitation to Join PropertyHub',
        html: `
          <h2>Welcome to PropertyHub!</h2>
          <p>You've been invited to join ${property.name} as a tenant.</p>
          <p><strong>Start Date:</strong> ${startDate}</p>
          ${endDate ? `<p><strong>End Date:</strong> ${endDate}</p>` : ''}
          <p>Click the link below to create your account and accept the invitation:</p>
          <p><a href="${inviteUrl}">Accept Invitation</a></p>
          <p>If you didn't expect this invitation, you can ignore this email.</p>
        `,
      }),
    })

    const data = await res.json()
    console.log("Email API response:", data)

    if (!res.ok) {
      console.error("Resend API error:", data)
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error in send-tenant-invitation function:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})