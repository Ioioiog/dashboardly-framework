import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { providerId } = await req.json()
    
    if (!providerId) {
      throw new Error('Provider ID is required')
    }

    // Update job status to in_progress
    const { error: updateError } = await supabase
      .from('scraping_jobs')
      .update({ 
        status: 'in_progress',
        last_run_at: new Date().toISOString()
      })
      .eq('utility_provider_id', providerId)

    if (updateError) {
      throw updateError
    }

    // Get provider credentials
    const { data: provider, error: providerError } = await supabase
      .from('utility_provider_credentials')
      .select('*')
      .eq('id', providerId)
      .single()

    if (providerError || !provider) {
      throw new Error('Provider not found')
    }

    // TODO: Implement actual scraping logic here
    // This is a placeholder that simulates scraping
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Update job status to completed
    const { error: completeError } = await supabase
      .from('scraping_jobs')
      .update({ 
        status: 'completed',
        last_run_at: new Date().toISOString()
      })
      .eq('utility_provider_id', providerId)

    if (completeError) {
      throw completeError
    }

    return new Response(
      JSON.stringify({ message: 'Scraping completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Scraping error:', error)

    // Update job status to failed
    if (req.body) {
      const { providerId } = await req.json()
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'failed',
          error_message: error.message,
          last_run_at: new Date().toISOString()
        })
        .eq('utility_provider_id', providerId)
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})