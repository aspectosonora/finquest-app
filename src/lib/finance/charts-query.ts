import "server-only";

import { db } from "@/lib/db";
import { monthKey } from "@/lib/date/month";
import { getTeamDefaultSplit } from "@/lib/finance/split-query";

function lastNMonthKeys(n: number, from: Date = new Date()) {
  const keys: { key: string; label: string }[] = [];
  for (let i = n - 1; i >= 0; i--) {
    // Mediodía UTC evita que, al formatear en una zona detrás de UTC
    // (p. ej. America/Hermosillo, UTC-7), el día 1 "ruede" al mes anterior.
    const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() - i, 1, 12));
    const key = monthKey(d);
    const label = new Intl.DateTimeFormat("es-MX", { month: "short" }).format(d).replace(".", "");
    keys.push({ key, label: label.toUpperCase() });
  }
  return keys;
}

/** Ingresos cobrados vs gastos reales, por mes, últimos `months` meses. */
export async function monthlyIncomeVsExpense(teamId: string, months = 6) {
  const months_ = lastNMonthKeys(months);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const movements = await db.movement.findMany({
    where: {
      teamId,
      type: { in: ["INCOME_RECEIVED", "EXPENSE"] },
      occurredAt: { gte: since },
    },
  });

  return months_.map(({ key, label }) => {
    const inMonth = movements.filter((m) => monthKey(m.occurredAt) === key);
    const income = inMonth.filter((m) => m.type === "INCOME_RECEIVED").reduce((s, m) => s + m.amountCents, 0);
    const expense = inMonth
      .filter((m) => m.type === "EXPENSE")
      .reduce((s, m) => s + Math.abs(m.amountCents), 0);
    return { label, a: income, b: expense };
  });
}

/** Gastos del mes actual por categoría de presupuesto (incluye "Sin categoría"). */
export async function currentMonthExpensesByCategory(teamId: string) {
  const key = monthKey();
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const [movements, categories] = await Promise.all([
    db.movement.findMany({
      where: { teamId, type: "EXPENSE", occurredAt: { gte: start, lte: end } },
    }),
    db.budgetCategory.findMany({ where: { teamId } }),
  ]);

  const nameById = new Map(categories.map((c) => [c.id, c.name]));
  const totals = new Map<string, number>();

  for (const m of movements) {
    const label = m.relatedBudgetCategoryId ? (nameById.get(m.relatedBudgetCategoryId) ?? "Otros") : "Sin categoría";
    totals.set(label, (totals.get(label) ?? 0) + Math.abs(m.amountCents));
  }

  return Array.from(totals.entries())
    .map(([label, cents]) => ({ label, cents }))
    .sort((a, b) => b.cents - a.cents);
}

/** Ahorro aportado por mes (a cualquier meta), últimos `months` meses. */
export async function savingsEvolution(teamId: string, months = 6) {
  const months_ = lastNMonthKeys(months);
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);

  const contributions = await db.goalContribution.findMany({
    where: { goal: { teamId }, contributedAt: { gte: since } },
  });

  return months_.map(({ key, label }) => {
    const total = contributions
      .filter((c) => monthKey(c.contributedAt) === key)
      .reduce((s, c) => s + c.amountCents, 0);
    return { label, cents: total };
  });
}

/** Saldo restante de cada deuda configurada (activa o derrotada), y el total reducido. */
export async function debtReductionSummary(teamId: string) {
  const debts = await db.debt.findMany({
    where: { teamId, status: { not: "UNCONFIGURED" } },
    include: { payments: true },
  });

  const items = debts.map((debt) => {
    const paidPrincipal = debt.payments.reduce((s, p) => s + p.principalCents, 0);
    const balanceCents = Math.max(0, debt.initialAmountCents - paidPrincipal);
    return { label: debt.name, cents: balanceCents };
  });

  const totalInitial = debts.reduce((s, d) => s + d.initialAmountCents, 0);
  const totalRemaining = items.reduce((s, i) => s + i.cents, 0);
  const totalReduced = Math.max(0, totalInitial - totalRemaining);

  return { items, totalInitial, totalRemaining, totalReduced };
}

/**
 * Compara, por integrante, lo pactado (su % del pago mensual total de deudas
 * configuradas) contra lo realmente abonado a deudas este mes. Los abonos
 * registrados como "Equipo (compartido)" no se atribuyen a ninguno de los dos.
 */
export async function pledgedVsActualThisMonth(teamId: string) {
  const [split, debts, members] = await Promise.all([
    getTeamDefaultSplit(teamId),
    db.debt.findMany({ where: { teamId, status: "ACTIVE" } }),
    db.user.findMany({ where: { teamId }, orderBy: { createdAt: "asc" } }),
  ]);

  const totalMonthlyCommitmentCents = debts.reduce((s, d) => s + (d.monthlyPaymentCents ?? 0), 0);

  const key = monthKey();
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

  const payments = await db.movement.findMany({
    where: { teamId, type: "DEBT_PAYMENT", occurredAt: { gte: start, lte: end } },
  });

  return members.map((member) => {
    const share = split?.shares.find((s) => s.userId === member.id);
    const pledgedCents = share ? Math.round((totalMonthlyCommitmentCents * share.percent) / 100) : 0;
    const actualCents = payments
      .filter((p) => p.userId === member.id)
      .reduce((s, p) => s + Math.abs(p.amountCents), 0);
    return { label: member.name, a: pledgedCents, b: actualCents };
  });
}
