import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, userId, email } = req.body || {};

  if (!priceId || !userId || !email) {
    return res.status(400).json({ error: "Missing priceId, userId, or email" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      client_reference_id: userId, // read back in the webhook to link the Stripe customer to the Supabase user
      subscription_data: {
        metadata: { supabase_user_id: userId }
      },
      metadata: { supabase_user_id: userId },
      success_url: `${req.headers.origin}/?checkout=success`,
      cancel_url: `${req.headers.origin}/?checkout=cancelled`
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return res.status(500).json({ error: "Could not create checkout session" });
  }
}
