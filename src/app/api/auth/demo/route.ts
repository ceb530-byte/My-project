import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth/session";
import { upsertUser } from "@/lib/db/users";

export async function POST() {
  const dbUser = await upsertUser({
    email: "demo@plotpulse.app",
    name: "Demo User",
    postcode: "SW11 4QR",
  });

  const user = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    postcode: dbUser.postcode,
    tier: dbUser.tier as "free" | "premium",
  };

  await setSessionCookie(user);
  return NextResponse.json({ user });
}
