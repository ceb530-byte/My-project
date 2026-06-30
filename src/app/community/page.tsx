"use client";

import { AppShell } from "@/components/layout/AppShell";
import { CommunityPage } from "@/components/community/CommunityPage";

export default function CommunityRoute() {
  return (
    <AppShell>
      <CommunityPage />
    </AppShell>
  );
}
