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
  propertyIds: string[];
  properties: Property[];
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
    if (!RESEND_API_KEY) {
      throw new Error('Missing RESEND_API_KEY environment variable')
    }

    const requestData: InvitationRequest = await req.json()
    const { email, firstName, lastName, properties, token, startDate, endDate } = requestData
    
    console.log('Processing invitation request:', {
      email,
      firstName,
      lastName,
      properties,
      token,
      startDate,
      endDate
    })

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY)
    
    // Use the correct domain in the invitation URL
    const inviteUrl = `${req.headers.get('origin')}/tenant-registration?invitation=${token}`

    console.log('Sending invitation email to:', email)
    console.log('Using invite URL:', inviteUrl)

    const { data: emailResponse, error: emailError } = await resend.emails.send({
      from: 'Admin Chirii <noreply@adminchirii.ro>',
      to: [email],
      subject: 'Invitation to Join Property Management Platform',
      html: `
        <p>Hello ${firstName || ''} ${lastName || ''},</p>
        <p>You have been invited to join our property management platform for the following properties:</p>
        ${properties.map(property => `
          <div style="margin-bottom: 10px;">
            <strong>${property.name}</strong><br/>
            ${property.address}
          </div>
        `).join('')}
        <p>Tenancy Details:</p>
        <ul>
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

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Invitation sent successfully',
      data: emailResponse 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Error in send-tenant-invitation function:', error)
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})