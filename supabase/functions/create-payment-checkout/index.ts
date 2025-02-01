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
    console.log('Creating payment session for invoice ID:', paymentId);
    
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

    // Get the invoice details including the property and landlord info
    console.log('Fetching invoice details...');
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from('invoices')
      .select(`
        *,
        landlord:profiles!invoices_landlord_id_fkey (
          stripe_account_id,
          email
        ),
        property:properties (
          name,
          address
        )
      `)
      .eq('id', paymentId)
      .single();

    console.log('Invoice query result:', { invoice, invoiceError });

    if (invoiceError) {
      console.error('Error fetching invoice:', invoiceError);
      throw new Error('Error fetching invoice details');
    }

    if (!invoice) {
      console.error('Invoice not found for ID:', paymentId);
      throw new Error('Invoice not found');
    }

    const stripeAccountId = invoice.landlord?.stripe_account_id;
    if (!stripeAccountId) {
      console.error('Landlord has not connected Stripe account');
      throw new Error('Landlord has not connected Stripe account');
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });

    // Create or retrieve customer
    let customer;
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    if (customers.data.length > 0) {
      customer = customers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
    }

    console.log('Creating payment session...');
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price_data: {
            currency: invoice.currency.toLowerCase(),
            product_data: {
              name: `Invoice Payment for ${invoice.property.name}`,
              description: `Payment for ${invoice.property.address}`,
            },
            unit_amount: Math.round(invoice.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.headers.get('origin')}/invoices?success=true`,
      cancel_url: `${req.headers.get('origin')}/invoices?canceled=true`,
      metadata: {
        invoice_id: invoice.id,
        tenant_id: user.id,
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