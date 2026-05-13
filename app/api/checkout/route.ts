import { NextResponse } from "next/server";
import { getStripeCheckoutProduct } from "@/lib/stripe-products";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const { productId } = (await request.json()) as { productId?: string };
    const product = productId ? getStripeCheckoutProduct(productId) : undefined;

    if (!product) {
      return NextResponse.json({ error: "Unknown product." }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency,
            unit_amount: product.unitAmount,
            product_data: {
              name: product.name,
              description: product.description,
              metadata: {
                productId: product.id
              }
            }
          }
        }
      ],
      metadata: {
        productId: product.id
      },
      success_url: `${appUrl}/shop/success?session_id={CHECKOUT_SESSION_ID}&product=${product.id}`,
      cancel_url: `${appUrl}/shop/cancel?product=${product.id}`,
      allow_promotion_codes: true
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe Checkout session creation failed", error);
    return NextResponse.json(
      { error: "Unable to create checkout session." },
      { status: 500 }
    );
  }
}
