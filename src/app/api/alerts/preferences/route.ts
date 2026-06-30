import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const prefsSchema = z.object({
  emailEnabled: z.boolean().optional(),
  planningAlerts: z.boolean().optional(),
  priceAlerts: z.boolean().optional(),
  crimeAlerts: z.boolean().optional(),
  floodAlerts: z.boolean().optional(),
  digestFrequency: z.enum(["instant", "daily", "weekly"]).optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const prefs = await prisma.alertPreference.findUnique({
    where: { userId: user.id },
  });

  return NextResponse.json({ preferences: prefs });
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = prefsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid preferences" }, { status: 400 });
  }

  const preferences = await prisma.alertPreference.upsert({
    where: { userId: user.id },
    update: parsed.data,
    create: { userId: user.id, ...parsed.data },
  });

  return NextResponse.json({ preferences });
}
