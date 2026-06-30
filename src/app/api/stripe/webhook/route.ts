import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import { upgradeUserTier } from "@/lib/db/users";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ received: true, mock: true });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      const subscriptionId = session.subscription as string | null;
      if (userId) {
        await upgradeUserTier(userId, "premium");
        if (subscriptionId) {
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscriptionId },
            update: { status: "active" },
            create: {
              userId,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: subscriptionId,
              status: "active",
            },
          });
        }
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object;
      const userId = sub.metadata?.userId;
      if (userId) {
        await upgradeUserTier(userId, "free");
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "cancelled" },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }
}
