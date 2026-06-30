import { AppShell } from "@/components/layout/AppShell";
import { AlertsList } from "@/components/alerts/AlertsList";
import { alerts } from "@/lib/mock-data";

export default function AlertsPage() {
  return (
    <AppShell>
      <AlertsList alerts={alerts} />
    </AppShell>
  );
}
