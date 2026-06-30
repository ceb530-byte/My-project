"use client";

import { useMemo } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { formatRelativeDate, formatPercent } from "@/lib/format";
import { useUser } from "@/context/UserContext";
import type { Alert } from "@/lib/types";

export function LiveAlerts() {
  const { property, loading } = useUser();

  const alerts = useMemo((): Alert[] => {
    if (!property) return [];
    const items: Alert[] = [];
    let id = 1;

    for (const app of property.planning.slice(0, 2)) {
      items.push({
        id: `alert-${id++}`,
        type: "planning_neighbour",
        title: `Planning: ${app.reference}`,
        message: app.description.slice(0, 120),
        createdAt: new Date().toISOString(),
        read: false,
        priority: "medium",
      });
    }

    if (property.valuation.valueChangePercent !== 0) {
      items.push({
        id: `alert-${id++}`,
        type: "price_change",
        title: `${property.location.sector} prices moved`,
        message: `Average prices in ${property.valuation.region} ${property.valuation.valueChangePercent >= 0 ? "rose" : "fell"} ${formatPercent(property.valuation.valueChangePercent)} (${property.valuation.hpiMonth}).`,
        createdAt: new Date().toISOString(),
        read: false,
        priority: "medium",
      });
    }

    if (property.crime.antisocialCount > 5) {
      items.push({
        id: `alert-${id++}`,
        type: "crime_spike",
        title: "Antisocial behaviour reports nearby",
        message: `${property.crime.antisocialCount} ASB incidents within 750m in ${property.crime.month}.`,
        createdAt: new Date().toISOString(),
        read: false,
        priority: "high",
      });
    }

    if (property.flood.activeWarnings.length > 0) {
      items.push({
        id: `alert-${id++}`,
        type: "development_approved",
        title: "Active flood alert",
        message: property.flood.activeWarnings[0].description,
        createdAt: new Date().toISOString(),
        read: false,
        priority: "high",
      });
    }

    return items;
  }, [property]);

  const unread = alerts.filter((a) => !a.read).length;

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-200" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Smart alerts</h1>
        <p className="text-slate-500">
          {unread} unread · generated from live data for your postcode
        </p>
      </div>

      {alerts.length === 0 ? (
        <Card>
          <p className="text-slate-600">No alerts for your area right now.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card key={alert.id} className="border-teal-200 bg-teal-50/20">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-600" />
                  <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                </div>
                <Badge variant={alert.priority === "high" ? "danger" : "warning"}>
                  {alert.priority}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
              <p className="mt-2 text-xs text-slate-400">
                {formatRelativeDate(alert.createdAt)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
