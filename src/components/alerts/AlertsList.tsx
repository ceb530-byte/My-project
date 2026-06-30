import { Card, Badge } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/format";
import type { Alert } from "@/lib/types";

const priorityVariant = {
  low: "default" as const,
  medium: "warning" as const,
  high: "danger" as const,
};

export function AlertsList({ alerts }: { alerts: Alert[] }) {
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Smart alerts</h1>
          <p className="text-slate-500">
            {unread} unread · personalised to your postcode area
          </p>
        </div>
      </div>

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
              <Badge variant={priorityVariant[alert.priority]}>
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
    </div>
  );
}
