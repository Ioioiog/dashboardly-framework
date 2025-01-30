import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Fetching exchange rates from BNR...');
    
    // Using BNR's official XML feed which is more reliable
    const response = await fetch('https://www.bnr.ro/nbrfxrates.xml');
    
    if (!response.ok) {
      throw new Error(`BNR API error: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Simple XML parsing to extract rates
    const getRate = (currency: string): number => {
      const match = xmlText.match(new RegExp(`<Rate currency="${currency}">(\\d+\\.?\\d*)</Rate>`));
      return match ? parseFloat(match[1]) : 0;
    };

    const rates = {
      USD: getRate('USD') || 4.56, // Fallback value
      EUR: getRate('EUR') || 4.97, // Fallback value
      RON: 1 // Base currency
    };

    console.log('Parsed exchange rates:', rates);

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
    
    // Return fallback rates instead of error
    const fallbackRates = {
      rates: {
        USD: 4.56,
        EUR: 4.97,
        RON: 1
      }
    };

    return new Response(
      JSON.stringify(fallbackRates),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});