"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, Badge } from "@/components/ui/Card";
import { Button, LinkButton } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { useUser } from "@/context/UserContext";

interface DocumentRecord {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: string;
  expiryDate: string | null;
  notes: string | null;
  createdAt: string;
  reminders: Array<{
    id: string;
    title: string;
    dueDate: string;
    type: string;
  }>;
}

interface ReminderRecord {
  id: string;
  title: string;
  description: string | null;
  type: string;
  dueDate: string;
  documentName: string | null;
}

const CATEGORIES = [
  { value: "", label: "Auto-detect" },
  { value: "insurance", label: "Insurance" },
  { value: "epc", label: "EPC certificate" },
  { value: "gas_safety", label: "Gas safety (CP12)" },
  { value: "utility", label: "Utility contract" },
  { value: "mortgage", label: "Mortgage" },
  { value: "lease", label: "Lease / tenancy" },
  { value: "conveyancing", label: "Deeds / conveyancing" },
  { value: "other", label: "Other" },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsPage() {
  const { user } = useUser();
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [limit, setLimit] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const refresh = useCallback(async () => {
    const [docsRes, remRes] = await Promise.all([
      fetch("/api/documents"),
      fetch("/api/reminders"),
    ]);
    if (docsRes.ok) {
      const data = await docsRes.json();
      setDocuments(data.documents ?? []);
      setLimit(data.limit ?? null);
    }
    if (remRes.ok) {
      const data = await remRes.json();
      setReminders(data.reminders ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const uploadFile = async (file: File) => {
    if (!user) {
      setError("Sign in to upload documents");
      return;
    }

    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    if (category) formData.append("category", category);
    if (expiryDate) formData.append("expiryDate", expiryDate);
    if (notes) formData.append("notes", notes);

    const res = await fetch("/api/documents", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      setUploading(false);
      return;
    }

    setNotes("");
    setExpiryDate("");
    setCategory("");
    await refresh();
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const deleteDocument = async (id: string) => {
    if (!confirm("Delete this document and its reminders?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    await refresh();
  };

  const completeReminder = async (id: string) => {
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderId: id, completed: true }),
    });
    await refresh();
  };

  const isOverdue = (dueDate: string) => new Date(dueDate) < new Date();

  if (!user) {
    return (
      <Card>
        <p className="text-slate-600">
          <a href="/onboarding" className="font-medium text-teal-700 underline">
            Sign in
          </a>{" "}
          to store property documents and get automatic reminders.
        </p>
      </Card>
    );
  }

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-200" />;
  }

  const atLimit = limit !== null && documents.length >= limit;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Document storage</h1>
        <p className="text-slate-500">
          Upload deeds, insurance, EPCs, and certificates — PlotPulse creates
          reminders and to-dos automatically.
        </p>
        {limit !== null && (
          <p className="mt-1 text-sm text-slate-400">
            {documents.length}/{limit} documents used (free plan)
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title="Upload document"
              subtitle="PDF, JPG, PNG, or Word · max 10 MB"
            />
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <label className="block text-sm">
                <span className="text-slate-600">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="text-slate-600">Expiry / renewal date</span>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block text-sm sm:col-span-1">
                <span className="text-slate-600">Notes (optional)</span>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Aviva buildings policy"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </label>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
                dragOver
                  ? "border-teal-500 bg-teal-50"
                  : "border-slate-200 bg-slate-50/50"
              } ${atLimit ? "opacity-50 pointer-events-none" : ""}`}
            >
              <p className="text-slate-600">
                Drag & drop a file here, or{" "}
                <label className="cursor-pointer font-medium text-teal-700 underline">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    disabled={atLimit || uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadFile(file);
                    }}
                  />
                </label>
              </p>
              {uploading && (
                <p className="mt-2 text-sm text-teal-600">Analysing & creating reminders…</p>
              )}
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {atLimit && (
              <div className="mt-4 flex items-center gap-3">
                <p className="text-sm text-amber-700">Document limit reached.</p>
                <LinkButton href="/premium" variant="premium" size="sm">
                  Upgrade
                </LinkButton>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Your documents"
              subtitle={`${documents.length} stored`}
            />
            {documents.length === 0 ? (
              <p className="text-sm text-slate-500">
                No documents yet. Upload an insurance policy or EPC to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-slate-100 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-slate-900">
                          {doc.originalName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {doc.category} · {formatFileSize(doc.sizeBytes)} ·{" "}
                          {formatDate(doc.createdAt)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {doc.expiryDate && (
                          <Badge variant="warning">
                            Expires {formatDate(doc.expiryDate)}
                          </Badge>
                        )}
                        <Badge>{doc.reminders.length} reminders</Badge>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <a
                        href={`/api/documents/${doc.id}`}
                        className="text-sm text-teal-700 hover:underline"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => deleteDocument(doc.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader
              title="Auto-generated to-dos"
              subtitle="From your uploaded documents"
            />
            {reminders.length === 0 ? (
              <p className="text-sm text-slate-500">
                Reminders appear when you upload documents with expiry dates or
                recognisable types (insurance, EPC, gas safety, etc.).
              </p>
            ) : (
              <div className="space-y-3">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    className={`rounded-lg border px-3 py-2 ${
                      isOverdue(r.dueDate)
                        ? "border-red-200 bg-red-50/50"
                        : "border-slate-100"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">
                      {r.title}
                    </p>
                    {r.documentName && (
                      <p className="text-xs text-slate-500">{r.documentName}</p>
                    )}
                    <p className="mt-1 text-xs text-slate-400">
                      Due {formatDate(r.dueDate)}
                      {isOverdue(r.dueDate) && (
                        <span className="ml-1 text-red-600">· overdue</span>
                      )}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1 px-0"
                      onClick={() => completeReminder(r.id)}
                    >
                      Mark done
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="mt-4">
            <h3 className="font-semibold text-slate-900">What we detect</h3>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              <li>Insurance → renewal reminders (30 & 7 days)</li>
              <li>EPC → expiry (10-year validity)</li>
              <li>Gas safety CP12 → annual check</li>
              <li>Utility contracts → renewal alerts</li>
              <li>Mortgage → rate review reminders</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
