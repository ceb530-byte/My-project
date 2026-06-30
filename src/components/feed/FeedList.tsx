import { Card, Badge } from "@/components/ui/Card";
import { formatDistance } from "@/lib/local-area";
import { formatRelativeDate } from "@/lib/format";
import type { FeedCategory, FeedItem } from "@/lib/types";

const categoryLabels: Record<FeedCategory, string> = {
  planning: "Planning",
  development: "Development",
  transport: "Transport",
  schools: "Schools",
  retail: "Retail",
  crime: "Crime & ASB",
  roads: "Road closures",
  community: "Community",
};

const categoryColors: Record<FeedCategory, string> = {
  planning: "bg-violet-100 text-violet-800",
  development: "bg-blue-100 text-blue-800",
  transport: "bg-cyan-100 text-cyan-800",
  schools: "bg-emerald-100 text-emerald-800",
  retail: "bg-pink-100 text-pink-800",
  crime: "bg-red-100 text-red-800",
  roads: "bg-orange-100 text-orange-800",
  community: "bg-slate-100 text-slate-800",
};

export function FeedList({ items }: { items: FeedItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <Card className={item.premium ? "border-amber-200 bg-amber-50/30" : ""}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[item.category]}`}
          >
            {categoryLabels[item.category]}
          </span>
          {item.premium && <Badge variant="premium">Premium</Badge>}
        </div>
        <span className="text-xs text-slate-400">
          {formatRelativeDate(item.publishedAt)}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900">
        {item.title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        {item.summary}
      </p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {formatDistance(item.distanceMetres)} away · {item.source}
        </span>
      </div>

      {item.actionable && (
        <div className="mt-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
          <span className="font-medium">How to benefit: </span>
          {item.actionable}
        </div>
      )}
    </Card>
  );
}
