"use client";

import { AppShell } from "@/components/layout/AppShell";
import { DocumentsPage } from "@/components/documents/DocumentsPage";

export default function DocumentsRoute() {
  return (
    <AppShell>
      <DocumentsPage />
    </AppShell>
  );
}
