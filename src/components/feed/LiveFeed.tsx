"use client";

import { useEffect, useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { FeedList } from "@/components/feed/FeedList";
import { useUser } from "@/context/UserContext";
import { getRecommendedLocalArea } from "@/lib/local-area";
import type { FeedItem } from "@/lib/types";

export function LiveFeed() {
  const { property, user, loading } = useUser();
  const [items, setItems] = useState<FeedItem[]>([]);

  useEffect(() => {
    if (property?.feed) {
      setItems(property.feed);
    }
  }, [property]);

  const postcode = user?.postcode ?? "SW11 4QR";
  const area = getRecommendedLocalArea(postcode);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-200" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Local intelligence</h1>
        <p className="text-slate-500">{area.userFacingSummary}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>planning.data.gov.uk</Badge>
          <Badge>data.police.uk</Badge>
          <Badge>HM Land Registry</Badge>
          <Badge>Environment Agency</Badge>
        </div>
      </div>

      {items.length > 0 ? (
        <FeedList items={items} />
      ) : (
        <Card>
          <p className="text-slate-600">Loading live feed data…</p>
        </Card>
      )}
    </div>
  );
}
