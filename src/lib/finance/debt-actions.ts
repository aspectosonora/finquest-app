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

export type DebtFormState = { error?: string } | null;

const schema = z.object({
  debtId: z.string().min(1),
  name: z.string().trim().min(1, "Falta el nombre."),
  initialAmount: z.coerce.number().min(0, "El monto no puede ser negativo."),
  isShared: z.string().optional(),
  ownerId: z.string().optional().or(z.literal("")),
  dueDayOfMonth: optionalNumber(z.coerce.number().int().min(1).max(31)),
  monthlyPayment: optionalNumber(),
  interestRate: optionalNumber(),
});

export async function createOtherDebtAction() {
  const user = await requireCurrentUser();
  const nextSortOrder = await db.debt.count({ where: { teamId: user.teamId } });
  const debt = await db.debt.create({
    data: {
      teamId: user.teamId,
      category: "OTHER",
      name: "Nueva deuda",
      status: "UNCONFIGURED",
      sortOrder: nextSortOrder,
    },
  });
  updateTag(FINANCE_CACHE_TAG);
  redirect(`/deudas/${debt.id}/configurar`);
}

export async function configureDebtAction(
  _prev: DebtFormState,
  formData: FormData
): Promise<DebtFormState> {
  const user = await requireCurrentUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const { debtId, name, initialAmount, isShared, ownerId, dueDayOfMonth, monthlyPayment, interestRate } =
    parsed.data;

  const debt = await db.debt.findFirst({ where: { id: debtId, teamId: user.teamId } });
  if (!debt) return { error: "No se encontró la deuda." };

  const shared = isShared === "on" || isShared === "true";
  const initialAmountCents = pesosToCents(initialAmount);

  await db.debt.update({
    where: { id: debtId },
    data: {
      name,
      initialAmountCents,
      isShared: shared,
      ownerId: shared ? null : ownerId || null,
      dueDayOfMonth: dueDayOfMonth ?? null,
      monthlyPaymentCents: monthlyPayment ? pesosToCents(monthlyPayment) : null,
      interestRateBp: interestRate ? Math.round(interestRate * 100) : null,
      status: initialAmountCents > 0 ? "ACTIVE" : "UNCONFIGURED",
      configuredAt: new Date(),
    },
  });

  await evaluateInitialChallenges(user.teamId);
  updateTag(FINANCE_CACHE_TAG);
  redirect("/deudas?configurado=1");
}

export async function setDebtStrategyAction(formData: FormData) {
  const user = await requireCurrentUser();
  const strategy = String(formData.get("strategy") ?? "");
  if (strategy !== "SNOWBALL" && strategy !== "AVALANCHE") return;

  const debts = await db.debt.findMany({
    where: { teamId: user.teamId, status: "ACTIVE" },
    include: { payments: true },
  });

  const ranked = [...debts].sort((a, b) => {
    if (strategy === "SNOWBALL") {
      const balanceA = a.initialAmountCents - a.payments.reduce((sum, p) => sum + p.principalCents, 0);
      const balanceB = b.initialAmountCents - b.payments.reduce((sum, p) => sum + p.principalCents, 0);
      return balanceA - balanceB;
    }
    return (b.interestRateBp ?? 0) - (a.interestRateBp ?? 0);
  });

  await db.$transaction([
    db.team.update({ where: { id: user.teamId }, data: { debtStrategy: strategy } }),
    ...ranked.map((debt, index) => db.debt.update({ where: { id: debt.id }, data: { sortOrder: index } })),
  ]);

  updateTag(FINANCE_CACHE_TAG);
  redirect("/deudas?estrategia=1");
}
