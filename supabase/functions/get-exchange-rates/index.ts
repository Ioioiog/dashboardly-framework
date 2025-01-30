import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ExchangeRate {
  currency: string;
  rate: number;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Fetching exchange rates from CursBNR...');
    const response = await fetch('https://www.cursbnr.ro/api/rates/latest');
    
    if (!response.ok) {
      throw new Error(`CursBNR API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received data from CursBNR:', data);

    // Extract RON and EUR rates from the API response
    const eurRate = data.find((rate: ExchangeRate) => rate.currency === 'EUR')?.rate || 0.92;
    const usdRate = data.find((rate: ExchangeRate) => rate.currency === 'USD')?.rate || 1;

    // Calculate and format all possible conversion rates
    const rates = {
      USD: usdRate,
      EUR: eurRate,
      RON: 1, // Base rate in RON since CursBNR provides rates in RON
    };

    console.log('Formatted exchange rates:', rates);

    return new Response(
      JSON.stringify({ rates }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch exchange rates',
        details: error.message 
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});