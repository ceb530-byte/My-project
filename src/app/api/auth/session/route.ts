import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth/session";
import { parsePostcode } from "@/lib/local-area";
import { lookupPostcode } from "@/lib/api/postcodes";

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  postcode: z.string().min(5).max(10),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid signup data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const pc = parsePostcode(parsed.data.postcode);
  if (!pc.isValid) {
    return NextResponse.json({ error: "Invalid UK postcode" }, { status: 400 });
  }

  const geo = await lookupPostcode(pc.full);
  if (!geo) {
    return NextResponse.json({ error: "Postcode not found" }, { status: 404 });
  }

  const user = {
    id: `dev-${Buffer.from(parsed.data.email).toString("base64url").slice(0, 12)}`,
    name: parsed.data.name,
    email: parsed.data.email,
    postcode: geo.postcode,
    tier: "free" as const,
  };

  await setSessionCookie(user);

  return NextResponse.json({ user, verified: true });
}

export async function DELETE() {
  const { clearSessionCookie } = await import("@/lib/auth/session");
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
