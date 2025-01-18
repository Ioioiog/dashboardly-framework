import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@14.21.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId } = await req.json();
    console.log('Creating payment session for payment ID:', paymentId);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    );

    // Get the utility details including the property and landlord info
    console.log('Fetching utility details...');
    const { data: utility, error: utilityError } = await supabaseClient
      .from('utilities')
      .select(`
        *,
        property:properties (
          name,
          address,
          landlord:profiles (
            stripe_account_id,
            email
          )
        )
      `)
      .eq('id', paymentId)
      .single();

    console.log('Utility query result:', { utility, utilityError });

    if (utilityError) {
      console.error('Error fetching utility:', utilityError);
      throw new Error('Error fetching utility details');
    }

    if (!utility) {
      console.error('Utility not found for ID:', paymentId);
      throw new Error('Utility not found');
    }

    const stripeAccountId = utility.property?.landlord?.stripe_account_id;
    if (!stripeAccountId) {
      console.error('Landlord has not connected Stripe account');
      throw new Error('Landlord has not connected Stripe account');
    }

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User authentication error:', userError);
      throw new Error('Unauthorized');
    }

    // Get user's email from profiles
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.email) {
      console.error('Profile fetch error:', profileError);
      throw new Error('User profile not found');
    }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Creating payment session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${utility.type} Bill`,
              description: `Utility payment for ${utility.property.address}`,
            },
            unit_amount: Math.round(utility.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/utilities?success=true`,
      cancel_url: `${req.headers.get('origin')}/utilities?canceled=true`,
      customer_email: profile.email,
      metadata: {
        utility_id: utility.id,
      },
      payment_intent_data: {
        transfer_data: {
          destination: stripeAccountId,
        },
      },
    });

    console.log('Payment session created:', session.id);
    return new Response(
      JSON.stringify({ url: session.url }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error creating payment session:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});