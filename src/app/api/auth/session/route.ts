import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { setSessionCookie } from "@/lib/auth/session";
import { parsePostcode } from "@/lib/local-area";
import { lookupPostcode } from "@/lib/api/postcodes";
import { upsertUser } from "@/lib/db/users";
import { sendEmail, welcomeEmailHtml } from "@/lib/email";

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

  const dbUser = await upsertUser({
    email: parsed.data.email,
    name: parsed.data.name,
    postcode: geo.postcode,
  });

  const user = {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    postcode: dbUser.postcode,
    tier: dbUser.tier as "free" | "premium",
  };

  await setSessionCookie(user);

  await sendEmail({
    to: user.email,
    subject: `Welcome to PlotPulse — monitoring ${user.postcode}`,
    html: welcomeEmailHtml(user.name, user.postcode),
    userId: user.id,
    type: "welcome",
  });

  return NextResponse.json({ user, verified: true });
}

export async function DELETE() {
  const { clearSessionCookie } = await import("@/lib/auth/session");
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
