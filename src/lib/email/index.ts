import { Resend } from "resend";
import { isResendEnabled } from "../env";
import { prisma } from "../db";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!isResendEnabled()) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

export async function sendEmail({
  to,
  subject,
  html,
  userId,
  type,
}: {
  to: string;
  subject: string;
  html: string;
  userId?: string;
  type: string;
}): Promise<{ sent: boolean; mock?: boolean }> {
  const client = getResend();
  const from =
    process.env.EMAIL_FROM ?? "PlotPulse <alerts@plotpulse.app>";

  if (!client) {
    console.log(`[email mock] To: ${to}\nSubject: ${subject}\n${html.slice(0, 200)}…`);
    if (userId) {
      await prisma.emailLog.create({
        data: { userId, type, subject, status: "mock" },
      });
    }
    return { sent: true, mock: true };
  }

  const { error } = await client.emails.send({ from, to, subject, html });

  if (userId) {
    await prisma.emailLog.create({
      data: {
        userId,
        type,
        subject,
        status: error ? "failed" : "sent",
      },
    });
  }

  if (error) {
    console.error("Email send failed:", error);
    return { sent: false };
  }

  return { sent: true };
}

export function alertDigestHtml({
  name,
  postcode,
  alerts,
}: {
  name: string;
  postcode: string;
  alerts: Array<{ title: string; message: string; priority: string }>;
}): string {
  const items = alerts
    .map(
      (a) =>
        `<li style="margin-bottom:12px"><strong>${a.title}</strong><br/><span style="color:#64748b">${a.message}</span></li>`
    )
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h1 style="color:#0f766e">PlotPulse</h1>
      <p>Hi ${name}, here's what's changed around <strong>${postcode}</strong>:</p>
      <ul style="padding-left:20px">${items}</ul>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/alerts" style="color:#0f766e">View all alerts →</a></p>
      <p style="color:#94a3b8;font-size:12px">You're receiving this because email alerts are enabled. Manage preferences in your account settings.</p>
    </div>
  `;
}

export function welcomeEmailHtml(name: string, postcode: string): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h1 style="color:#0f766e">Welcome to PlotPulse</h1>
      <p>Hi ${name}, we're now monitoring changes around <strong>${postcode}</strong>.</p>
      <p>You'll receive alerts for planning applications, price movements, crime updates, and flood warnings in your local area.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/dashboard" style="color:#0f766e">View your dashboard →</a></p>
    </div>
  `;
}
