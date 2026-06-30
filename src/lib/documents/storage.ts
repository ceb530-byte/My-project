import { mkdir, writeFile, unlink, readFile } from "fs/promises";
import path from "path";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

export function getUploadDir(userId: string): string {
  return path.join(UPLOAD_ROOT, userId);
}

export async function saveUploadedFile(
  userId: string,
  documentId: string,
  originalName: string,
  buffer: Buffer
): Promise<string> {
  const dir = getUploadDir(userId);
  await mkdir(dir, { recursive: true });

  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${documentId}-${safeName}`;
  const storagePath = path.join(dir, filename);

  await writeFile(storagePath, buffer);
  return storagePath;
}

export async function deleteStoredFile(storagePath: string): Promise<void> {
  try {
    await unlink(storagePath);
  } catch {
    // file may already be gone
  }
}

export async function readStoredFile(storagePath: string): Promise<Buffer> {
  return readFile(storagePath);
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const FREE_TIER_DOC_LIMIT = 5;
