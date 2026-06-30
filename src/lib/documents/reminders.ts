import { prisma } from "../db";
import type { DocumentAnalysis } from "./analyzer";

export async function createRemindersFromAnalysis(
  userId: string,
  documentId: string,
  analysis: DocumentAnalysis
) {
  const created = [];

  for (const reminder of analysis.reminders) {
    const existing = await prisma.reminder.findFirst({
      where: {
        userId,
        documentId,
        title: reminder.title,
        dueDate: reminder.dueDate,
      },
    });
    if (existing) continue;

    const record = await prisma.reminder.create({
      data: {
        userId,
        documentId,
        title: reminder.title,
        description: reminder.description,
        type: reminder.type,
        dueDate: reminder.dueDate,
      },
    });

    if (reminder.dueDate <= addDays(new Date(), 30)) {
      await prisma.alert.create({
        data: {
          userId,
          type: mapReminderToAlertType(reminder.type),
          title: reminder.title,
          message: reminder.description ?? reminder.title,
          priority: reminder.dueDate <= addDays(new Date(), 7) ? "high" : "medium",
        },
      });
    }

    created.push(record);
  }

  return created;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function mapReminderToAlertType(
  type: string
): string {
  const map: Record<string, string> = {
    insurance_renewal: "insurance_renewal",
    epc_expiry: "maintenance",
    gas_safety: "maintenance",
    utility_renewal: "utility_contract",
    mortgage_review: "maintenance",
    maintenance: "maintenance",
    generic: "maintenance",
  };
  return map[type] ?? "maintenance";
}

export async function getUserReminders(userId: string, includeCompleted = false) {
  return prisma.reminder.findMany({
    where: {
      userId,
      ...(includeCompleted ? {} : { completed: false }),
    },
    orderBy: { dueDate: "asc" },
    include: {
      document: { select: { originalName: true, category: true } },
    },
  });
}

export async function getDueReminders(withinDays = 7) {
  const now = new Date();
  const horizon = addDays(now, withinDays);

  return prisma.reminder.findMany({
    where: {
      completed: false,
      emailed: false,
      dueDate: { lte: horizon },
    },
    include: {
      user: true,
      document: { select: { originalName: true } },
    },
  });
}

export async function completeReminder(reminderId: string, userId: string) {
  return prisma.reminder.updateMany({
    where: { id: reminderId, userId },
    data: { completed: true },
  });
}
