"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getTeamDefaultSplit } from "@/lib/finance/split-query";
import { getCurrentTurnUserId } from "@/lib/finance/fixed-expenses-query";
import { pesosToCents } from "@/lib/finance/money";
import { optionalText } from "@/lib/validation/zod-helpers";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type FixedExpenseFormState = { error?: string } | null;

const createTypeSchema = z.object({
  name: z.string().trim().min(1, "Falta el nombre.").max(60),
  responsibleUserId: z.string().min(1, "Selecciona quién es responsable."),
});

export async function createFixedExpenseTypeAction(
  _prev: FixedExpenseFormState,
  formData: FormData
): Promise<FixedExpenseFormState> {
  const user = await requireCurrentUser();
  const parsed = createTypeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const responsible = user.team.members.find((m) => m.id === parsed.data.responsibleUserId);
  if (!responsible) {
    return { error: "Ese integrante no pertenece al equipo." };
  }

  await db.fixedExpenseType.create({
    data: {
      teamId: user.teamId,
      name: parsed.data.name,
      responsibleUserId: parsed.data.responsibleUserId,
    },
  });

  redirect("/equipo/configuracion?gasto_fijo=1");
}

export async function deleteFixedExpenseTypeAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await db.fixedExpenseType.deleteMany({ where: { id, teamId: user.teamId } });
  redirect("/equipo/configuracion?gasto_fijo_eliminado=1");
}

const paymentSchema = z.object({
  fixedExpenseTypeId: z.string().min(1, "Selecciona el gasto fijo."),
  amount: z.coerce.number().positive("El importe debe ser mayor a cero."),
  note: optionalText(),
  occurredAt: z.string().optional().or(z.literal("")),
  idempotencyKey: z.string().min(1, "Falta la clave de confirmación"),
});

export async function registerFixedExpensePaymentAction(
  _prev: FixedExpenseFormState,
  formData: FormData
): Promise<FixedExpenseFormState> {
  const user = await requireCurrentUser();
  const parsed = paymentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }

  const { fixedExpenseTypeId, amount, note, occurredAt, idempotencyKey } = parsed.data;
  const teamId = user.teamId;

  const existing = await db.movement.findUnique({ where: { idempotencyKey } });
  if (existing) {
    redirect("/inicio?registrado=1");
  }

  const fixedExpenseType = await db.fixedExpenseType.findFirst({
    where: { id: fixedExpenseTypeId, teamId },
  });
  if (!fixedExpenseType) {
    return { error: "No se encontró ese gasto fijo." };
  }

  const amountCents = pesosToCents(amount);
  const occurred = occurredAt ? new Date(occurredAt) : new Date();
  const memberIds = user.team.members.map((m) => m.id);
  const responsibleUserId = await getCurrentTurnUserId(
    fixedExpenseType.id,
    fixedExpenseType.responsibleUserId,
    memberIds
  );
  const otherUserId = user.team.members.find((m) => m.id !== responsibleUserId)?.id ?? null;

  let settlementOwerUserId: string | null = null;
  let settlementAmountCents: number | null = null;
  let settlementStatus: "PENDING" | null = null;

  if (otherUserId) {
    const split = await getTeamDefaultSplit(teamId);
    const responsiblePercent = split?.shares.find((s) => s.userId === responsibleUserId)?.percent ?? 50;
    const responsibleShareCents = Math.round((amountCents * responsiblePercent) / 100);
    const otherShareCents = amountCents - responsibleShareCents;
    if (otherShareCents > 0) {
      settlementOwerUserId = otherUserId;
      settlementAmountCents = otherShareCents;
      settlementStatus = "PENDING";
    }
  }

  await db.movement.create({
    data: {
      teamId,
      userId: responsibleUserId,
      type: "EXPENSE",
      amountCents: -amountCents,
      category: fixedExpenseType.name,
      note: note || null,
      occurredAt: occurred,
      relatedFixedExpenseTypeId: fixedExpenseType.id,
      settlementPayerUserId: settlementOwerUserId ? responsibleUserId : null,
      settlementOwerUserId,
      settlementAmountCents,
      settlementStatus,
      idempotencyKey,
    },
  });

  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo?gasto_fijo_registrado=1");
}

export async function markSettlementPaidAction(formData: FormData) {
  const user = await requireCurrentUser();
  const movementId = String(formData.get("movementId") ?? "");
  if (!movementId) return;

  await db.movement.updateMany({
    where: {
      id: movementId,
      teamId: user.teamId,
      settlementOwerUserId: user.id,
      settlementStatus: "PENDING",
    },
    data: { settlementStatus: "SETTLED", settlementSettledAt: new Date() },
  });

  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo?liquidado=1");
}
