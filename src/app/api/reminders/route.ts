import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  completeReminder,
  getUserReminders,
} from "@/lib/documents/reminders";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const reminders = await getUserReminders(user.id, false);

  return NextResponse.json({
    reminders: reminders.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      dueDate: r.dueDate.toISOString(),
      completed: r.completed,
      documentName: r.document?.originalName ?? null,
      documentCategory: r.document?.category ?? null,
    })),
  });
}

export async function PATCH(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { reminderId, completed } = await request.json();
  if (!reminderId) {
    return NextResponse.json({ error: "reminderId required" }, { status: 400 });
  }

  if (completed) {
    await completeReminder(reminderId, user.id);
  }

  return NextResponse.json({ ok: true });
}
