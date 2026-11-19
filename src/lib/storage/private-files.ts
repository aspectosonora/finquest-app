import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "uploads");

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * Guarda una imagen privada (fotos de metas, por ejemplo) fuera de /public,
 * para que solo se sirva a través de /api/files tras validar la sesión del
 * equipo dueño del archivo.
 */
export async function savePrivateImage(file: File, scope: string, teamId: string) {
  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error("Formato de imagen no soportado. Usa PNG, JPG o WEBP.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("La imagen no puede pesar más de 8 MB.");
  }

  const dir = path.join(STORAGE_ROOT, scope, teamId);
  await mkdir(dir, { recursive: true });

  const filename = `${randomUUID()}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `${scope}/${teamId}/${filename}`;
}

export function resolvePrivateFilePath(relativePath: string) {
  const normalized = path.normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  return path.join(STORAGE_ROOT, normalized);
}
