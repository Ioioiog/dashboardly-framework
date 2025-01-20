import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

console.log('Hello from send-tenant-invitation!')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, token, propertyId } = await req.json()

    if (!email || !token || !propertyId) {
      throw new Error('Missing required fields')
    }

    // Get property details
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration')
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const { data: property, error: propertyError } = await supabaseClient
      .from('properties')
      .select('name')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      console.error("Error fetching property:", propertyError)
      throw new Error('Failed to fetch property details')
    }

    // For development, only allow sending to the developer's email
    const isDevelopment = true // You can make this dynamic based on environment later
    const fromEmail = isDevelopment ? 'onboarding@resend.dev' : 'your-verified-domain@example.com'
    
    // In development, redirect all emails to the developer
    const toEmail = isDevelopment ? 'ilinca.obadescu@gmail.com' : email
    
    console.log(`Sending email from ${fromEmail} to ${toEmail} (Development mode: ${isDevelopment})`)

    // Construct invitation URL with the production domain
    const inviteUrl = `https://www.adminchirii.ro/tenant-registration?invitation=${token}`

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `PropertyHub <${fromEmail}>`,
        to: [toEmail],
        subject: 'Invitation to Join PropertyHub',
        html: `
          <h2>Welcome to PropertyHub!</h2>
          <p>You have been invited to join ${property.name} on PropertyHub.</p>
          <p>Click the link below to create your account and accept the invitation:</p>
          <p><a href="${inviteUrl}">Accept Invitation</a></p>
          <p>If you didn't expect this invitation, you can ignore this email.</p>
          ${isDevelopment ? `<p>Development Mode: Original recipient was ${email}</p>` : ''}
        `,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Error sending email:', data)
      throw new Error(data.message || 'Failed to send email')
    }

    return new Response(JSON.stringify({ 
      success: true,
      development: isDevelopment,
      originalEmail: email,
      sentTo: toEmail 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})