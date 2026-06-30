import { prisma } from "../db";
import type { PropertyIntelligence } from "../api/intelligence";

export async function syncAlertsForUser(
  userId: string,
  intelligence: PropertyIntelligence
) {
  const prefs = await prisma.alertPreference.findUnique({
    where: { userId },
  });

  const alertsToCreate: Array<{
    type: string;
    title: string;
    message: string;
    priority: string;
  }> = [];

  if (prefs?.planningAlerts !== false) {
    for (const app of intelligence.planning.slice(0, 3)) {
      alertsToCreate.push({
        type: "planning_neighbour",
        title: `Planning: ${app.reference}`,
        message: app.description.slice(0, 200),
        priority: "medium",
      });
    }
  }

  if (prefs?.priceAlerts !== false && intelligence.valuation.valueChangePercent !== 0) {
    alertsToCreate.push({
      type: "price_change",
      title: `${intelligence.location.sector} prices moved`,
      message: `Average in ${intelligence.valuation.region} changed by ${intelligence.valuation.valueChangePercent.toFixed(1)}% (${intelligence.valuation.hpiMonth}).`,
      priority: "medium",
    });
  }

  if (prefs?.crimeAlerts !== false && intelligence.crime.antisocialCount > 5) {
    alertsToCreate.push({
      type: "crime_spike",
      title: "Antisocial behaviour reports nearby",
      message: `${intelligence.crime.antisocialCount} ASB incidents within 750m (${intelligence.crime.month}).`,
      priority: "high",
    });
  }

  if (prefs?.floodAlerts !== false && intelligence.flood.activeWarnings.length > 0) {
    alertsToCreate.push({
      type: "development_approved",
      title: "Active flood alert",
      message: intelligence.flood.activeWarnings[0].description,
      priority: "high",
    });
  }

  for (const alert of alertsToCreate) {
    const existing = await prisma.alert.findFirst({
      where: { userId, title: alert.title, read: false },
    });
    if (!existing) {
      await prisma.alert.create({
        data: { userId, ...alert },
      });
    }
  }
}

export async function getUserAlerts(userId: string) {
  return prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function markAlertRead(alertId: string, userId: string) {
  return prisma.alert.updateMany({
    where: { id: alertId, userId },
    data: { read: true },
  });
}
