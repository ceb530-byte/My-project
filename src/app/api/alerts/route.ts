import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { getUserAlerts, markAlertRead } from "@/lib/alerts/sync";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const alerts = await getUserAlerts(user.id);
  return NextResponse.json({ alerts });
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { alertId } = await request.json();
  if (!alertId) {
    return NextResponse.json({ error: "alertId required" }, { status: 400 });
  }

  await markAlertRead(alertId, user.id);
  return NextResponse.json({ ok: true });
}
