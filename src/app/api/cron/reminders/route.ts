import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getDueReminders } from "@/lib/documents/reminders";
import { sendEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const dueReminders = await getDueReminders(7);
  let sent = 0;

  const byUser = new Map<string, typeof dueReminders>();
  for (const r of dueReminders) {
    const list = byUser.get(r.userId) ?? [];
    list.push(r);
    byUser.set(r.userId, list);
  }

  for (const [userId, reminders] of byUser) {
    const user = reminders[0].user;
    const items = reminders
      .map(
        (r) =>
          `<li style="margin-bottom:8px"><strong>${r.title}</strong><br/><span style="color:#64748b">${r.description ?? ""}</span><br/><span style="font-size:12px">Due ${r.dueDate.toLocaleDateString("en-GB")}</span></li>`
      )
      .join("");

    const html = `
      <div style="font-family:sans-serif;max-width:560px">
        <h1 style="color:#0f766e">PlotPulse document reminders</h1>
        <p>Hi ${user.name}, you have ${reminders.length} upcoming reminder${reminders.length > 1 ? "s" : ""} from your stored documents:</p>
        <ul>${items}</ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/documents">Manage documents →</a></p>
      </div>
    `;

    const result = await sendEmail({
      to: user.email,
      subject: `PlotPulse: ${reminders.length} document reminder${reminders.length > 1 ? "s" : ""} due`,
      html,
      userId,
      type: "document_reminder",
    });

    if (result.sent) {
      await prisma.reminder.updateMany({
        where: { id: { in: reminders.map((r) => r.id) } },
        data: { emailed: true },
      });
      sent++;
    }
  }

  return NextResponse.json({ dueReminders: dueReminders.length, emailsSent: sent });
}
