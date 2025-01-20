import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, firstName, lastName, propertyId, token, startDate, endDate } = await req.json()

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing required environment variables')
    }

    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2')
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Fetch property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      throw new Error('Property not found')
    }

    const resend = new Resend(RESEND_API_KEY)
    const inviteUrl = `https://www.adminchirii.ro/tenant-registration?token=${token}`

    console.log('Sending invitation email to:', email)
    console.log('Invite URL:', inviteUrl)

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: process.env.NODE_ENV === 'development' ? 'ilinca.obadescu@gmail.com' : email,
      subject: 'Invitation to Join Property Management Platform',
      html: `
        <p>Hello ${firstName} ${lastName},</p>
        <p>You have been invited to join our property management platform for the property: ${property.name}</p>
        <p>Please click the link below to complete your registration:</p>
        <p><a href="${inviteUrl}">Complete Registration</a></p>
        ${process.env.NODE_ENV === 'development' ? 
          `<p style="color: red;">DEVELOPMENT MODE: Original recipient was ${email}</p>` : 
          ''
        }
        <p>This invitation will expire in 7 days.</p>
      `
    })

    if (emailError) {
      console.error('Error sending email:', emailError)
      throw new Error('Failed to send invitation email')
    }

    console.log('Email sent successfully:', emailResponse)

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    })

  } catch (error) {
    console.error('Error in send-tenant-invitation function:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 500
    })
  }
})