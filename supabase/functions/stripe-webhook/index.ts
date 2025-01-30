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
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey || !webhookSecret) {
      console.error('Missing required environment variables');
      throw new Error('Configuration error');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    // Get the signature from the headers
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      throw new Error('No signature provided');
    }

    // Get the raw body
    const body = await req.text();
    
    // Verify the event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received Stripe webhook event:', event.type);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        
        // Get customer to find associated user
        const customer = await stripe.customers.retrieve(customerId);
        const userId = customer.metadata.supabaseUserId;
        
        if (!userId) {
          throw new Error('No Supabase user ID found in customer metadata');
        }

        // Map Stripe price to subscription plan
        const priceId = subscription.items.data[0].price.id;
        let subscriptionPlan;
        switch (priceId) {
          case 'price_1QmwtrRtTJ9GsUw4bAMVQw4t':
            subscriptionPlan = 'basic';
            break;
          case 'price_1Qmwv1RtTJ9GsUw4IR8K2QAD':
            subscriptionPlan = 'premium';
            break;
          case 'price_1QmwvtRtTJ9GsUw40laEPD91':
            subscriptionPlan = 'gold';
            break;
          default:
            subscriptionPlan = 'free';
        }

        // Update user's subscription in profiles table
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_plan: subscriptionPlan,
            subscription_start_date: new Date(subscription.current_period_start * 1000).toISOString(),
            subscription_end_date: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating subscription:', updateError);
          throw updateError;
        }

        console.log(`Updated subscription for user ${userId} to ${subscriptionPlan}`);
        break;

      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object;
        const deletedCustomerId = deletedSubscription.customer as string;
        const deletedCustomer = await stripe.customers.retrieve(deletedCustomerId);
        const deletedUserId = deletedCustomer.metadata.supabaseUserId;

        if (!deletedUserId) {
          throw new Error('No Supabase user ID found in customer metadata');
        }

        // Reset subscription to free plan
        const { error: deleteError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_plan: 'free',
            subscription_end_date: new Date().toISOString(),
          })
          .eq('id', deletedUserId);

        if (deleteError) {
          console.error('Error resetting subscription:', deleteError);
          throw deleteError;
        }

        console.log(`Reset subscription for user ${deletedUserId} to free plan`);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});