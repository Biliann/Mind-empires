import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret || webhookSecret.includes("replace_with")) {
    return NextResponse.json(
      { error: "Stripe webhook signing secret is not configured." },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid signature.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const productId = session.metadata?.productId;

    // TODO: In production, fulfill this purchase in a database here.
    // This MVP persists gameplay locally, so the success page applies localStorage rewards.
    console.info("Stripe Checkout completed", {
      sessionId: session.id,
      productId
    });
  }

  return NextResponse.json({ received: true });
}
