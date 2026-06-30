"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatRelativeDate } from "@/lib/format";

interface DbAlert {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  read: boolean;
  createdAt: string;
}

interface AlertPrefs {
  emailEnabled: boolean;
  planningAlerts: boolean;
  priceAlerts: boolean;
  crimeAlerts: boolean;
  floodAlerts: boolean;
  digestFrequency: string;
}

export function LiveAlerts() {
  const [alerts, setAlerts] = useState<DbAlert[]>([]);
  const [prefs, setPrefs] = useState<AlertPrefs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/alerts").then((r) => r.json()),
      fetch("/api/alerts/preferences").then((r) => r.json()),
    ]).then(([alertsData, prefsData]) => {
      setAlerts(alertsData.alerts ?? []);
      setPrefs(prefsData.preferences ?? null);
      setLoading(false);
    });
  }, []);

  const updatePref = async (key: keyof AlertPrefs, value: boolean | string) => {
    const res = await fetch("/api/alerts/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [key]: value }),
    });
    const data = await res.json();
    if (data.preferences) setPrefs(data.preferences);
  };

  const markRead = async (alertId: string) => {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ alertId }),
    });
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, read: true } : a))
    );
  };

  const unread = alerts.filter((a) => !a.read).length;

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-200" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Smart alerts</h1>
        <p className="text-slate-500">
          {unread} unread · persisted and synced from live data
        </p>
      </div>

      {prefs && (
        <Card>
          <h3 className="font-semibold text-slate-900">Email alert preferences</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["emailEnabled", "Email alerts enabled"],
                ["planningAlerts", "Planning applications"],
                ["priceAlerts", "Price movements"],
                ["crimeAlerts", "Crime & ASB"],
                ["floodAlerts", "Flood warnings"],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={prefs[key] as boolean}
                  onChange={(e) => updatePref(key, e.target.checked)}
                  className="rounded border-slate-300"
                />
                {label}
              </label>
            ))}
          </div>
          <div className="mt-3">
            <label className="text-sm text-slate-600">
              Digest frequency{" "}
              <select
                value={prefs.digestFrequency}
                onChange={(e) => updatePref("digestFrequency", e.target.value)}
                className="ml-2 rounded border border-slate-300 px-2 py-1"
              >
                <option value="instant">Instant</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </label>
          </div>
        </Card>
      )}

      {alerts.length === 0 ? (
        <Card>
          <p className="text-slate-600">
            No alerts yet. Visit your dashboard to sync live data for your postcode.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <Card
              key={alert.id}
              className={!alert.read ? "border-teal-200 bg-teal-50/20" : ""}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {!alert.read && (
                    <span className="h-2 w-2 rounded-full bg-teal-600" />
                  )}
                  <h3 className="font-semibold text-slate-900">{alert.title}</h3>
                </div>
                <Badge
                  variant={alert.priority === "high" ? "danger" : "warning"}
                >
                  {alert.priority}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {formatRelativeDate(alert.createdAt)}
                </span>
                {!alert.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markRead(alert.id)}
                  >
                    Mark read
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
