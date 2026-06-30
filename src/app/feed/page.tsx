"use client";

import { AppShell } from "@/components/layout/AppShell";
import { LiveFeed } from "@/components/feed/LiveFeed";

export default function FeedPage() {
  return (
    <AppShell>
      <LiveFeed />
    </AppShell>
  );
}
