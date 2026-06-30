import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { FREE_TIER_DOC_LIMIT } from "@/lib/documents/storage";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const documents = await prisma.document.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      reminders: {
        where: { completed: false },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  const count = documents.length;
  const limit = user.tier === "premium" ? null : FREE_TIER_DOC_LIMIT;

  return NextResponse.json({
    documents: documents.map((d) => ({
      id: d.id,
      originalName: d.originalName,
      mimeType: d.mimeType,
      sizeBytes: d.sizeBytes,
      category: d.category,
      expiryDate: d.expiryDate?.toISOString() ?? null,
      notes: d.notes,
      createdAt: d.createdAt.toISOString(),
      reminders: d.reminders.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        type: r.type,
        dueDate: r.dueDate.toISOString(),
        completed: r.completed,
      })),
    })),
    limit,
    count,
    tier: user.tier,
  });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const docCount = await prisma.document.count({ where: { userId: user.id } });
  if (user.tier !== "premium" && docCount >= FREE_TIER_DOC_LIMIT) {
    return NextResponse.json(
      {
        error: `Free plan limited to ${FREE_TIER_DOC_LIMIT} documents. Upgrade to Premium for unlimited storage.`,
        upgrade: true,
      },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const category = (formData.get("category") as string) || undefined;
  const expiryDateStr = formData.get("expiryDate") as string | null;
  const notes = (formData.get("notes") as string) || undefined;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, saveUploadedFile } = await import(
    "@/lib/documents/storage"
  );
  const { analyzeDocument } = await import("@/lib/documents/analyzer");
  const { createRemindersFromAnalysis } = await import(
    "@/lib/documents/reminders"
  );

  if (!ALLOWED_MIME_TYPES.includes(file.type) && file.type !== "") {
    return NextResponse.json(
      { error: "File type not allowed. Use PDF, JPG, PNG, or Word." },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum 10 MB." },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const documentId = crypto.randomUUID();

  const storagePath = await saveUploadedFile(
    user.id,
    documentId,
    file.name,
    buffer
  );

  const expiryDate = expiryDateStr ? new Date(expiryDateStr) : null;
  const analysis = analyzeDocument({
    filename: file.name,
    category: category as import("@/lib/documents/analyzer").DocumentCategory,
    expiryDate,
    notes,
  });

  const document = await prisma.document.create({
    data: {
      id: documentId,
      userId: user.id,
      filename: file.name,
      originalName: file.name,
      mimeType: file.type || "application/octet-stream",
      sizeBytes: file.size,
      category: analysis.category,
      storagePath,
      expiryDate: analysis.expiryDate,
      notes,
    },
  });

  const reminders = await createRemindersFromAnalysis(
    user.id,
    document.id,
    analysis
  );

  return NextResponse.json(
    {
      document: {
        id: document.id,
        originalName: document.originalName,
        category: document.category,
        expiryDate: document.expiryDate?.toISOString() ?? null,
        detectedLabel: analysis.detectedLabel,
        remindersCreated: reminders.length,
      },
      reminders: reminders.map((r) => ({
        id: r.id,
        title: r.title,
        dueDate: r.dueDate.toISOString(),
      })),
    },
    { status: 201 }
  );
}
