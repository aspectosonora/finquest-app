import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { savePrivateImage } from "@/lib/storage/private-files";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Falta el archivo." }, { status: 400 });
  }

  try {
    const relativePath = await savePrivateImage(file, "goals", user.teamId);
    return NextResponse.json({ path: relativePath });
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo subir la imagen.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
