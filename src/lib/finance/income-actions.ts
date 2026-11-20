"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { pesosToCents } from "@/lib/finance/money";
import { evaluateInitialChallenges } from "@/lib/finance/challenges-engine";
import { optionalNumber } from "@/lib/validation/zod-helpers";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type IncomeFormState = { error?: string } | null;

const schema = z.object({
  type: z.enum(["FIXED", "RECEIVABLE_CLIENT", "EXTRA"]),
  name: z.string().trim().min(1, "Falta el nombre de la fuente."),
  ownerId: z.string().min(1, "Selecciona a quién pertenece."),
  isVariable: z.string().optional(),
  amount: optionalNumber(),
  frequency: z.enum(["WEEKLY", "BIWEEKLY", "MONTHLY", "ONE_TIME", "IRREGULAR"]),
  expectedDay: optionalNumber(z.coerce.number().int().min(1).max(31)),
  expectedDate: z.string().optional().or(z.literal("")),
  notes: z.string().trim().max(300).optional().or(z.literal("")),
});

export async function createIncomeSourceAction(
  _prev: IncomeFormState,
  formData: FormData
): Promise<IncomeFormState> {
  const user = await requireCurrentUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const { type, name, ownerId, isVariable, amount, frequency, expectedDay, expectedDate, notes } =
    parsed.data;

  const variable = isVariable === "on" || isVariable === "true";
  const amountCents = !variable && amount ? pesosToCents(amount) : null;

  const source = await db.incomeSource.create({
    data: {
      teamId: user.teamId,
      ownerId,
      type,
      name,
      isVariable: variable,
      amountCents,
      frequency,
      expectedDay: expectedDay ?? null,
      notes: notes || null,
    },
  });

  if (type !== "FIXED" || amountCents) {
    await db.incomePayment.create({
      data: {
        incomeSourceId: source.id,
        amountCents: amountCents ?? 0,
        expectedDate: expectedDate ? new Date(expectedDate) : null,
        status: "PENDING",
      },
    });
  }

  await evaluateInitialChallenges(user.teamId);
  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo/ingresos?creado=1");
}

const collectSchema = z.object({
  paymentId: z.string().min(1),
  receivedAmount: z.coerce.number().positive("El importe debe ser mayor a cero."),
  idempotencyKey: z.string().min(1),
});

export async function collectIncomePaymentAction(
  _prev: IncomeFormState,
  formData: FormData
): Promise<IncomeFormState> {
  const user = await requireCurrentUser();
  const parsed = collectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }
  const { paymentId, receivedAmount, idempotencyKey } = parsed.data;

  const payment = await db.incomePayment.findFirst({
    where: { id: paymentId, incomeSource: { teamId: user.teamId } },
    include: { incomeSource: true },
  });
  if (!payment) return { error: "No se encontró el cobro." };

  const existingMovement = await db.movement.findUnique({ where: { idempotencyKey } });
  if (existingMovement) redirect("/equipo/ingresos?cobrado=1");

  const receivedCents = pesosToCents(receivedAmount);
  const isFullyPaid = receivedCents >= payment.amountCents;

  await db.$transaction([
    db.incomePayment.update({
      where: { id: paymentId },
      data: {
        receivedAmountCents: receivedCents,
        receivedDate: new Date(),
        status: isFullyPaid ? "PAID" : "PARTIAL",
      },
    }),
    db.movement.create({
      data: {
        teamId: user.teamId,
        userId: payment.incomeSource.ownerId,
        type: "INCOME_RECEIVED",
        amountCents: receivedCents,
        note: `Cobro: ${payment.incomeSource.name}`,
        relatedIncomePaymentId: paymentId,
        idempotencyKey,
      },
    }),
  ]);

  await evaluateInitialChallenges(user.teamId);
  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo/ingresos?cobrado=1");
}

export async function pauseIncomeSourceAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "");
  const nextStatus = String(formData.get("nextStatus") ?? "PAUSED");
  await db.incomeSource.updateMany({
    where: { id, teamId: user.teamId },
    data: { status: nextStatus as "ACTIVE" | "PAUSED" | "CANCELLED" },
  });
  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo/ingresos");
}
