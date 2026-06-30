"use client";

import { AppShell } from "@/components/layout/AppShell";
import { LiveAlerts } from "@/components/alerts/LiveAlerts";

export default function AlertsPage() {
  return (
    <AppShell>
      <LiveAlerts />
    </AppShell>
  );
}
