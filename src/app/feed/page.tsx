import { AppShell } from "@/components/layout/AppShell";
import { FeedList } from "@/components/feed/FeedList";
import { feedItems } from "@/lib/mock-data";
import { getRecommendedLocalArea } from "@/lib/local-area";

export default function FeedPage() {
  const area = getRecommendedLocalArea("SW11 4QR");

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Local intelligence</h1>
        <p className="text-slate-500">{area.userFacingSummary}</p>
      </div>
      <FeedList items={feedItems} />
    </AppShell>
  );
}
