import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  email: string;
  firstName: string | null;
  lastName: string | null;
  propertyId: string;
  token: string;
  startDate: string;
  endDate?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')

    if (!RESEND_API_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Missing environment variables:', {
        hasResendKey: !!RESEND_API_KEY,
        hasSupabaseUrl: !!SUPABASE_URL,
        hasSupabaseKey: !!SUPABASE_ANON_KEY
      })
      throw new Error('Missing required environment variables')
    }

    const requestData: InvitationRequest = await req.json()
    const { email, firstName, lastName, propertyId, token, startDate, endDate } = requestData
    
    console.log('Processing invitation request:', {
      email,
      firstName,
      lastName,
      propertyId,
      token,
      startDate,
      endDate
    })

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Fetch property details
    console.log('Fetching property details for ID:', propertyId)
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (propertyError) {
      console.error('Property fetch error:', propertyError)
      throw new Error(`Failed to fetch property: ${propertyError.message}`)
    }

    if (!property) {
      console.error('Property not found for ID:', propertyId)
      throw new Error('Property not found')
    }

    console.log('Found property:', property)

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY)
    const inviteUrl = `https://www.adminchirii.ro/tenant-registration?invitation=${token}`

    console.log('Sending invitation email to:', email)
    console.log('Using invite URL:', inviteUrl)

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: 'Admin Chirii <noreply@adminchirii.ro>',
      to: [email],
      subject: 'Invitation to Join Property Management Platform',
      html: `
        <p>Hello ${firstName || ''} ${lastName || ''},</p>
        <p>You have been invited to join our property management platform for the property: ${property.name}</p>
        <p>Property Details:</p>
        <ul>
          <li>Name: ${property.name}</li>
          <li>Address: ${property.address}</li>
          <li>Start Date: ${startDate}</li>
          ${endDate ? `<li>End Date: ${endDate}</li>` : ''}
        </ul>
        <p>Please click the link below to complete your registration:</p>
        <p><a href="${inviteUrl}" style="padding: 10px 20px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 5px;">Complete Registration</a></p>
        <p>This invitation will expire in 7 days.</p>
        <p>If you have any questions, please contact your landlord.</p>
      `
    })

    if (emailError) {
      console.error('Failed to send email:', emailError)
      throw new Error('Failed to send invitation email')
    }

    console.log('Email sent successfully:', emailResponse)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Invitation sent successfully',
        data: emailResponse 
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-tenant-invitation function:', error)
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})