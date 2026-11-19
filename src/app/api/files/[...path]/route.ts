import { NextResponse } from "next/server";
import { readFile, stat } from "node:fs/promises";
import { getCurrentUser } from "@/lib/auth/current-user";
import { resolvePrivateFilePath } from "@/lib/storage/private-files";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { path: segments } = await params;
  // Formato: <scope>/<teamId>/<archivo>. Solo se sirve si el equipo coincide.
  const [, teamId] = segments;
  if (teamId !== user.teamId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const relativePath = segments.join("/");
  const filePath = resolvePrivateFilePath(relativePath);

  try {
    await stat(filePath);
    const buffer = await readFile(filePath);
    const extension = filePath.split(".").pop()?.toLowerCase() ?? "";
    const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=86400",
      },
    });
  } catch {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }
}
