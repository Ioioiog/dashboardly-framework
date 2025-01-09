import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const { providerId } = await req.json()
    console.log('Starting scraping process for provider:', providerId)

    if (!providerId) {
      throw new Error('Provider ID is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Update job status to in_progress
    const { error: updateError } = await supabase
      .from('scraping_jobs')
      .upsert({
        utility_provider_id: providerId,
        status: 'in_progress',
        last_run_at: new Date().toISOString(),
      })

    if (updateError) {
      throw updateError
    }

    // Simulate scraping process
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Randomly succeed or fail for demonstration
    const success = Math.random() > 0.3

    if (!success) {
      throw new Error('Failed to scrape utility invoices')
    }

    // Update job status to completed
    const { error: completionError } = await supabase
      .from('scraping_jobs')
      .upsert({
        utility_provider_id: providerId,
        status: 'completed',
        last_run_at: new Date().toISOString(),
        error_message: null,
      })

    if (completionError) {
      throw completionError
    }

    return new Response(
      JSON.stringify({ message: 'Scraping completed successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in scraping process:', error)

    // If we have access to supabase client, update the job status
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase
          .from('scraping_jobs')
          .upsert({
            utility_provider_id: (await req.json()).providerId,
            status: 'failed',
            last_run_at: new Date().toISOString(),
            error_message: error.message,
          })
      }
    } catch (updateError) {
      console.error('Error updating job status:', updateError)
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during the scraping process' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})