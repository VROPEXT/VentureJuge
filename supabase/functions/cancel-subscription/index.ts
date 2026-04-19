import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.10.0";
import { corsHeaders } from "../_shared/cors.ts";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { user_id, email } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Find the Stripe customer by email
    const customers = await stripe.customers.list({ email, limit: 1 });

    if (customers.data.length === 0) {
      // No Stripe customer found — just return success (was a one-time payment)
      return new Response(JSON.stringify({ canceled: true, message: "no_stripe_customer" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customer = customers.data[0];

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
      limit: 10,
    });

    if (subscriptions.data.length === 0) {
      // No active subscription — was a one-time payment
      return new Response(JSON.stringify({ canceled: true, message: "no_active_subscription" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Cancel all active subscriptions at period end
    const cancelPromises = subscriptions.data.map((sub) =>
      stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
    );

    await Promise.all(cancelPromises);

    return new Response(
      JSON.stringify({
        canceled: true,
        message: "subscription_canceled_at_period_end",
        subscriptions_canceled: subscriptions.data.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Cancel subscription error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
