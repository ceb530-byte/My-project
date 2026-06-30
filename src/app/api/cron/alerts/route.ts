import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { buildPropertyIntelligence } from "@/lib/api/intelligence";
import { syncAlertsForUser } from "@/lib/alerts/sync";
import { sendEmail, alertDigestHtml } from "@/lib/email";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      alertPreferences: {
        emailEnabled: true,
        digestFrequency: { in: ["daily", "instant"] },
      },
    },
    include: { alertPreferences: true },
  });

  let sent = 0;

  for (const user of users) {
    const intelligence = await buildPropertyIntelligence(user.postcode);
    if (!intelligence) continue;

    await syncAlertsForUser(user.id, intelligence);

    const pendingAlerts = await prisma.alert.findMany({
      where: { userId: user.id, emailed: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (pendingAlerts.length === 0) continue;

    const result = await sendEmail({
      to: user.email,
      subject: `PlotPulse: ${pendingAlerts.length} update${pendingAlerts.length > 1 ? "s" : ""} near ${user.postcode}`,
      html: alertDigestHtml({
        name: user.name,
        postcode: user.postcode,
        alerts: pendingAlerts.map((a) => ({
          title: a.title,
          message: a.message,
          priority: a.priority,
        })),
      }),
      userId: user.id,
      type: "alert_digest",
    });

    if (result.sent) {
      await prisma.alert.updateMany({
        where: { id: { in: pendingAlerts.map((a) => a.id) } },
        data: { emailed: true },
      });
      sent++;
    }
  }

  return NextResponse.json({ processed: users.length, emailsSent: sent });
}
