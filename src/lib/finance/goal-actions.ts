"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { pesosToCents, clampPercent } from "@/lib/finance/money";
import { evaluateInitialChallenges } from "@/lib/finance/challenges-engine";
import { optionalNumber } from "@/lib/validation/zod-helpers";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type GoalFormState = { error?: string } | null;

const schema = z.object({
  name: z.string().trim().min(1, "Falta el nombre de la meta."),
  category: z.enum([
    "HOME",
    "TRAVEL",
    "VEHICLE",
    "TECH",
    "EMERGENCY_FUND",
    "EXPERIENCES",
    "PROJECTS",
    "CUSTOM",
  ]),
  targetAmount: z.coerce.number().positive("El objetivo debe ser mayor a cero."),
  mode: z.enum(["BY_DATE", "BY_BUDGET"]),
  targetDate: z.string().optional().or(z.literal("")),
  monthlyBudget: optionalNumber(),
  initialSavedAmount: optionalNumber(),
  isPrimary: z.string().optional(),
  splitJulio: optionalNumber(),
  photoPath: z.string().optional().or(z.literal("")),
});

export async function createGoalAction(
  _prev: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const user = await requireCurrentUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const {
    name,
    category,
    targetAmount,
    mode,
    targetDate,
    monthlyBudget,
    initialSavedAmount,
    isPrimary,
    splitJulio,
    photoPath,
  } = parsed.data;

  if (mode === "BY_DATE" && !targetDate) {
    return { error: "Elige la fecha objetivo." };
  }
  if (mode === "BY_BUDGET" && (!monthlyBudget || monthlyBudget <= 0)) {
    return { error: "Indica cuánto pueden ahorrar al mes." };
  }

  const makePrimary = isPrimary === "on" || isPrimary === "true";

  const goal = await db.$transaction(async (tx) => {
    if (makePrimary) {
      await tx.goal.updateMany({
        where: { teamId: user.teamId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const created = await tx.goal.create({
      data: {
        teamId: user.teamId,
        name,
        category,
        targetAmountCents: pesosToCents(targetAmount),
        mode,
        targetDate: targetDate ? new Date(targetDate) : null,
        monthlyBudgetCents: monthlyBudget ? pesosToCents(monthlyBudget) : null,
        isPrimary: makePrimary,
        photoUrl: photoPath || null,
      },
    });

    if (initialSavedAmount && initialSavedAmount > 0) {
      await tx.goalContribution.create({
        data: {
          goalId: created.id,
          userId: user.id,
          amountCents: pesosToCents(initialSavedAmount),
          note: "Saldo inicial registrado al crear la meta",
        },
      });
    }

    if (typeof splitJulio === "number" && user.team.members.length === 2) {
      const [first, second] = user.team.members;
      const julioPercent = clampPercent(splitJulio);
      await tx.split.create({
        data: {
          teamId: user.teamId,
          scope: "GOAL",
          goalId: created.id,
          shares: {
            create: [
              { userId: first.id, percent: julioPercent },
              { userId: second.id, percent: 100 - julioPercent },
            ],
          },
        },
      });
    }

    return created;
  });

  await evaluateInitialChallenges(user.teamId);
  updateTag(FINANCE_CACHE_TAG);
  redirect(`/metas?creada=1&goal=${goal.id}`);
}

export async function setPrimaryGoalAction(formData: FormData) {
  const user = await requireCurrentUser();
  const goalId = String(formData.get("goalId") ?? "");

  await db.$transaction([
    db.goal.updateMany({ where: { teamId: user.teamId, isPrimary: true }, data: { isPrimary: false } }),
    db.goal.updateMany({ where: { id: goalId, teamId: user.teamId }, data: { isPrimary: true } }),
  ]);

  updateTag(FINANCE_CACHE_TAG);
  redirect("/metas");
}
