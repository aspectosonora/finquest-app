"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { pesosToCents } from "@/lib/finance/money";
import { monthKey } from "@/lib/date/month";
import { evaluateInitialChallenges } from "@/lib/finance/challenges-engine";
import { evaluateWeeklyChallenges } from "@/lib/finance/weekly-challenges";
import { getAvailableToday } from "@/lib/finance/dashboard";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type CaptureFormState = { error?: string } | null;

const CAPTURE_TYPES = [
  "INGRESO_COBRADO",
  "GASTO",
  "PAGO",
  "ABONO_DEUDA",
  "APORTACION_META",
  "APARTAR",
  "LIBERAR_SUELDO",
] as const;

const baseSchema = z.object({
  tipo: z.enum(CAPTURE_TYPES),
  amount: z.coerce.number().positive("El importe debe ser mayor a cero."),
  userId: z.string().min(1).optional().or(z.literal("")),
  note: z.string().trim().max(200).optional().or(z.literal("")),
  occurredAt: z.string().optional().or(z.literal("")),
  debtId: z.string().optional().or(z.literal("")),
  goalId: z.string().optional().or(z.literal("")),
  budgetCategoryId: z.string().optional().or(z.literal("")),
  isExtraordinary: z.string().optional(),
  idempotencyKey: z.string().min(1, "Falta la clave de confirmación"),
});

export async function registerMovementAction(
  _prev: CaptureFormState,
  formData: FormData
): Promise<CaptureFormState> {
  const user = await requireCurrentUser();

  const parsed = baseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }

  const {
    tipo,
    amount,
    userId,
    note,
    occurredAt,
    debtId,
    goalId,
    budgetCategoryId,
    isExtraordinary,
    idempotencyKey,
  } = parsed.data;
  const teamId = user.teamId;
  const amountCents = pesosToCents(amount);
  const occurred = occurredAt ? new Date(occurredAt) : new Date();
  const attributedUserId = userId && userId.length > 0 ? userId : null;

  const existing = await db.movement.findUnique({ where: { idempotencyKey } });
  if (existing) {
    redirect(movementRedirectTarget(tipo, { debtDefeated: false, goalCompletedName: null }));
  }

  let debtDefeated = false;
  let goalCompletedName: string | null = null;

  switch (tipo) {
    case "INGRESO_COBRADO": {
      await db.movement.create({
        data: {
          teamId,
          userId: attributedUserId,
          type: "INCOME_RECEIVED",
          amountCents,
          note: note || null,
          occurredAt: occurred,
          idempotencyKey,
        },
      });
      break;
    }
    case "GASTO":
    case "PAGO": {
      await db.movement.create({
        data: {
          teamId,
          userId: attributedUserId,
          type: "EXPENSE",
          amountCents: -amountCents,
          category: tipo === "PAGO" ? "Pago" : "Gasto",
          note: note || null,
          occurredAt: occurred,
          relatedBudgetCategoryId: budgetCategoryId || null,
          idempotencyKey,
        },
      });
      break;
    }
    case "ABONO_DEUDA": {
      if (!debtId) return { error: "Selecciona la deuda a abonar." };
      const debt = await db.debt.findFirst({ where: { id: debtId, teamId }, include: { payments: true } });
      if (!debt || debt.status === "UNCONFIGURED") {
        return { error: "Configura la deuda antes de registrar un abono." };
      }

      const extraordinary = isExtraordinary === "on" || isExtraordinary === "true";

      await db.$transaction(async (tx) => {
        await tx.debtPayment.create({
          data: {
            debtId,
            amountCents,
            principalCents: amountCents,
            isExtraordinary: extraordinary,
            registeredById: user.id,
            paidAt: occurred,
          },
        });
        await tx.movement.create({
          data: {
            teamId,
            userId: attributedUserId,
            type: "DEBT_PAYMENT",
            amountCents: -amountCents,
            note: note || null,
            occurredAt: occurred,
            relatedDebtId: debtId,
            idempotencyKey,
          },
        });

        const paidPrincipal =
          debt.payments.reduce((sum, p) => sum + p.principalCents, 0) + amountCents;
        if (paidPrincipal >= debt.initialAmountCents) {
          await tx.debt.update({
            where: { id: debtId },
            data: { status: "DEFEATED", defeatedAt: new Date() },
          });
          await tx.badge.upsert({
            where: { teamId_badgeKey_sourceId: { teamId, badgeKey: "boss_derrotado", sourceId: debtId } },
            update: {},
            create: {
              teamId,
              badgeKey: "boss_derrotado",
              title: `¡Boss derrotado! ${debt.name}`,
              sourceType: "DEBT_DEFEATED",
              sourceId: debtId,
            },
          });
          debtDefeated = true;
        }
      });
      break;
    }
    case "APORTACION_META": {
      if (!goalId) return { error: "Selecciona la meta a aportar." };
      const goal = await db.goal.findFirst({ where: { id: goalId, teamId }, include: { contributions: true } });
      if (!goal) return { error: "No se encontró la meta." };

      await db.$transaction(async (tx) => {
        await tx.goalContribution.create({
          data: {
            goalId,
            userId: attributedUserId ?? user.id,
            amountCents,
            contributedAt: occurred,
            note: note || null,
          },
        });
        await tx.movement.create({
          data: {
            teamId,
            userId: attributedUserId,
            type: "GOAL_CONTRIBUTION",
            amountCents: -amountCents,
            note: note || null,
            occurredAt: occurred,
            relatedGoalId: goalId,
            idempotencyKey,
          },
        });

        const accumulated = goal.contributions.reduce((sum, c) => sum + c.amountCents, 0) + amountCents;
        if (!goal.isCompleted && accumulated >= goal.targetAmountCents) {
          await tx.goal.update({
            where: { id: goalId },
            data: { isCompleted: true, completedAt: new Date() },
          });
          await tx.badge.upsert({
            where: { teamId_badgeKey_sourceId: { teamId, badgeKey: "meta_cumplida", sourceId: goalId } },
            update: {},
            create: {
              teamId,
              badgeKey: "meta_cumplida",
              title: `¡Meta cumplida! ${goal.name}`,
              sourceType: "GOAL_COMPLETED",
              sourceId: goalId,
            },
          });
          goalCompletedName = goal.name;
        }
      });
      break;
    }
    case "APARTAR": {
      await db.movement.create({
        data: {
          teamId,
          userId: attributedUserId,
          type: "ADJUSTMENT",
          amountCents: -amountCents,
          category: "Apartado",
          note: note || "Dinero apartado",
          occurredAt: occurred,
          idempotencyKey,
        },
      });
      break;
    }
    case "LIBERAR_SUELDO": {
      if (!attributedUserId) return { error: "Selecciona a quién le corresponde el sueldo." };
      const available = await getAvailableToday(teamId);
      if (amountCents > available) {
        return { error: "No hay disponible suficiente para liberar ese sueldo." };
      }

      await db.$transaction(async (tx) => {
        await tx.salaryRelease.create({
          data: {
            teamId,
            userId: attributedUserId,
            amountCents,
            monthLabel: monthKey(occurred),
            releasedAt: occurred,
            note: note || null,
          },
        });
        await tx.movement.create({
          data: {
            teamId,
            userId: attributedUserId,
            type: "SALARY_RELEASE",
            amountCents: -amountCents,
            note: note || null,
            occurredAt: occurred,
            idempotencyKey,
          },
        });
      });
      break;
    }
  }

  await evaluateInitialChallenges(teamId);
  await evaluateWeeklyChallenges(teamId);
  updateTag(FINANCE_CACHE_TAG);
  redirect(movementRedirectTarget(tipo, { debtDefeated, goalCompletedName }));
}

function movementRedirectTarget(
  tipo: (typeof CAPTURE_TYPES)[number],
  flags: { debtDefeated: boolean; goalCompletedName: string | null }
) {
  switch (tipo) {
    case "ABONO_DEUDA":
      return flags.debtDefeated ? "/deudas?debt_defeated=1" : "/deudas?payment=1";
    case "APORTACION_META":
      return flags.goalCompletedName
        ? `/metas?goal_completed=${encodeURIComponent(flags.goalCompletedName)}`
        : "/metas?registrado=1";
    case "LIBERAR_SUELDO":
      return "/equipo?registrado=1";
    default:
      return "/inicio?registrado=1";
  }
}
