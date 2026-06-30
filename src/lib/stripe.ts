import Stripe from "stripe";
import { isStripeEnabled } from "./env";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (!isStripeEnabled()) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return stripeClient;
}

export async function createPremiumCheckoutSession({
  customerEmail,
  userId,
  successUrl,
  cancelUrl,
}: {
  customerEmail: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const stripe = getStripe();
  if (!stripe) {
    return { mock: true as const, url: `${successUrl}?mock_checkout=1` };
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: customerEmail,
    line_items: [
      {
        price: process.env.STRIPE_PREMIUM_PRICE_ID!,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });

  return { mock: false as const, url: session.url! };
}
