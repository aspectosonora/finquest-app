import "server-only";
import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-haiku-4-5";

const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export type ReceiptExtraction = {
  amountPesos: number | null;
  occurredAt: string | null;
  note: string | null;
  budgetCategoryId: string | null;
};

export async function extractReceiptFromImage({
  imageBase64,
  mimeType,
  categories,
}: {
  imageBase64: string;
  mimeType: string;
  categories: { id: string; name: string }[];
}): Promise<ReceiptExtraction> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("La lectura de recibos con IA no está configurada todavía.");
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType as AllowedMimeType)) {
    throw new Error("Formato de imagen no soportado. Usa PNG, JPG o WEBP.");
  }

  const client = new Anthropic({ apiKey });

  const categoryList =
    categories.map((c) => `- ${c.id}: ${c.name}`).join("\n") || "(sin categorías configuradas)";

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: { type: "base64", media_type: mimeType as AllowedMimeType, data: imageBase64 },
          },
          {
            type: "text",
            text: `Lee este recibo o ticket de compra y responde SOLO con un objeto JSON (sin texto extra, sin markdown) con esta forma exacta:
{"amountPesos": number|null, "date": "YYYY-MM-DD"|null, "merchant": string|null, "categoryId": string|null}

Reglas:
- "amountPesos" es el TOTAL pagado en pesos mexicanos (MXN), como número (ej. 345.50). Si no se ve con claridad, usa null.
- "date" es la fecha del ticket en formato YYYY-MM-DD. Si no aparece, usa null.
- "merchant" es el nombre del comercio o una descripción corta (máx 40 caracteres). Si no se distingue, usa null.
- "categoryId" debe ser EXACTAMENTE uno de estos IDs si el gasto encaja claramente, si no null:
${categoryList}
- No inventes datos que no puedas leer con claridad en la imagen.`,
          },
        ],
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("La IA no devolvió una respuesta legible.");
  }

  let parsed: unknown;
  try {
    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : textBlock.text);
  } catch {
    throw new Error("No se pudo interpretar la respuesta de la IA.");
  }

  const result = parsed as {
    amountPesos?: number | null;
    date?: string | null;
    merchant?: string | null;
    categoryId?: string | null;
  };

  const validCategoryIds = new Set(categories.map((c) => c.id));

  return {
    amountPesos:
      typeof result.amountPesos === "number" && result.amountPesos > 0 ? result.amountPesos : null,
    occurredAt:
      typeof result.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(result.date) ? result.date : null,
    note:
      typeof result.merchant === "string" && result.merchant.trim()
        ? result.merchant.trim().slice(0, 100)
        : null,
    budgetCategoryId:
      typeof result.categoryId === "string" && validCategoryIds.has(result.categoryId)
        ? result.categoryId
        : null,
  };
}
