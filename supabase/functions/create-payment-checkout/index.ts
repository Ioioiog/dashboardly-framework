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

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      console.error('User authentication error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Authenticated user:', user.id);

    // Get the payment details including the tenancy and landlord info
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select(`
        *,
        tenancy:tenancies (
          tenant:profiles!tenancies_tenant_id_fkey (
            email,
            stripe_account_id
          ),
          property:properties (
            name,
            address,
            landlord:profiles!properties_landlord_id_fkey (
              stripe_account_id
            )
          )
        )
      `)
      .eq('id', paymentId)
      .maybeSingle();

    console.log('Payment query result:', { payment, paymentError });

    if (paymentError) {
      console.error('Error fetching payment:', paymentError);
      throw new Error('Error fetching payment details');
    }

    if (!payment) {
      console.error('Payment not found for ID:', paymentId);
      throw new Error('Payment not found');
    }

    const stripeAccountId = payment.tenancy.property.landlord.stripe_account_id;
    if (!stripeAccountId) {
      console.error('Landlord has not connected Stripe account');
      throw new Error('Landlord has not connected Stripe account');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    console.log('Creating payment session...');
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: payment.currency.toLowerCase(),
            product_data: {
              name: `Rent Payment - ${payment.tenancy.property.name}`,
              description: `Payment for ${payment.tenancy.property.address}`,
            },
            unit_amount: Math.round(payment.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/financial?success=true`,
      cancel_url: `${req.headers.get('origin')}/financial?canceled=true`,
      customer_email: user.email, // Pre-fill customer email
      metadata: {
        payment_id: payment.id,
        tenant_id: user.id,
        property_id: payment.tenancy.property.id,
      },
      payment_intent_data: {
        transfer_data: {
          destination: stripeAccountId, // Transfer payment to landlord's connected account
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