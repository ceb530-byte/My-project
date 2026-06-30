import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const user = {
    id: "demo-user",
    name: "Demo User",
    email: "demo@plotpulse.app",
    postcode: "SW11 4QR",
    tier: "free" as const,
  };

  await setSessionCookie(user);
  return NextResponse.json({ user });
}
