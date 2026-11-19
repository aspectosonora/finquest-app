"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { extractReceiptFromImage, type ReceiptExtraction } from "@/lib/ai/receipt";

export type ExtractReceiptResult = { data?: ReceiptExtraction; error?: string };

export async function extractReceiptAction(
  imageBase64: string,
  mimeType: string
): Promise<ExtractReceiptResult> {
  const user = await requireCurrentUser();

  if (!imageBase64 || imageBase64.length < 100) {
    return { error: "No se recibió una imagen válida." };
  }

  const budgets = await db.budgetCategory.findMany({
    where: { teamId: user.teamId },
    orderBy: { createdAt: "asc" },
  });

  try {
    const data = await extractReceiptFromImage({
      imageBase64,
      mimeType,
      categories: budgets.map((b) => ({ id: b.id, name: b.name })),
    });
    return { data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo leer el recibo.";
    return { error: message };
  }
}
