import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { createPremiumCheckoutSession } from "@/lib/stripe";
import { APP_URL } from "@/lib/env";

export async function POST(_request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const result = await createPremiumCheckoutSession({
    customerEmail: user.email,
    userId: user.id,
    successUrl: `${APP_URL}/premium?upgraded=1`,
    cancelUrl: `${APP_URL}/premium?cancelled=1`,
  });

  return NextResponse.json({
    url: result.url,
    mock: result.mock,
  });
}
