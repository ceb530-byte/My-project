"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PropertyDashboard } from "@/components/dashboard/PropertyDashboard";
import { useUser } from "@/context/UserContext";

export default function DashboardPage() {
  const { property, loading } = useUser();

  return (
    <AppShell>
      <PropertyDashboard data={property} loading={loading} />
    </AppShell>
  );
}
