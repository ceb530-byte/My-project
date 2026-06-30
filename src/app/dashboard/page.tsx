import { AppShell } from "@/components/layout/AppShell";
import { PropertyDashboard } from "@/components/dashboard/PropertyDashboard";
import { demoProperty } from "@/lib/mock-data";

export default function DashboardPage() {
  return (
    <AppShell>
      <PropertyDashboard property={demoProperty} />
    </AppShell>
  );
}
