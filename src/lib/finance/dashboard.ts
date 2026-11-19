import "server-only";

import { db } from "@/lib/db";

/**
 * Disponible hoy = dinero realmente recibido - pagos - reservas - sueldos
 * liberados, tal como lo registra el ledger único (Movement). Nunca incluye
 * dinero por cobrar ni proyectado.
 */
export async function getAvailableToday(teamId: string): Promise<number> {
  const result = await db.movement.aggregate({
    where: { teamId },
    _sum: { amountCents: true },
  });
  return result._sum.amountCents ?? 0;
}

export async function getTeamXp(teamId: string): Promise<number> {
  const result = await db.xpAward.aggregate({
    where: { teamId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function getPersonalFreeMoney(userId: string): Promise<number> {
  const result = await db.salaryRelease.aggregate({
    where: { userId },
    _sum: { amountCents: true },
  });
  return result._sum.amountCents ?? 0;
}

export async function getTeamSavings(teamId: string): Promise<number> {
  const result = await db.goalContribution.aggregate({
    where: { goal: { teamId } },
    _sum: { amountCents: true },
  });
  return result._sum.amountCents ?? 0;
}

export async function getPrimaryGoal(teamId: string) {
  const goal = await db.goal.findFirst({
    where: { teamId, isPrimary: true, isCompleted: false },
    include: { contributions: true },
  });
  if (!goal) return null;

  const accumulatedCents = goal.contributions.reduce((sum, c) => sum + c.amountCents, 0);
  return { ...goal, accumulatedCents };
}

export async function getActiveBoss(teamId: string) {
  const debts = await db.debt.findMany({
    where: { teamId, status: "ACTIVE" },
    orderBy: { sortOrder: "asc" },
    include: { payments: true },
  });

  if (debts.length === 0) return null;

  const [debt] = debts;
  const paidPrincipal = debt.payments.reduce((sum, p) => sum + p.principalCents, 0);
  const balanceCents = Math.max(0, debt.initialAmountCents - paidPrincipal);

  return { ...debt, balanceCents };
}

export async function getDebtsSummary(teamId: string) {
  const debts = await db.debt.findMany({
    where: { teamId },
    include: { payments: true },
    orderBy: { sortOrder: "asc" },
  });

  return debts.map((debt) => {
    const paidPrincipal = debt.payments.reduce((sum, p) => sum + p.principalCents, 0);
    const balanceCents =
      debt.status === "UNCONFIGURED" ? 0 : Math.max(0, debt.initialAmountCents - paidPrincipal);
    const progressPercent =
      debt.status === "DEFEATED"
        ? 100
        : debt.initialAmountCents > 0
          ? Math.min(100, Math.round((paidPrincipal / debt.initialAmountCents) * 100))
          : 0;
    return { ...debt, balanceCents, progressPercent };
  });
}

export async function getUpcomingChallenges(teamId: string, take = 3) {
  return db.challenge.findMany({
    where: { teamId, status: "ACTIVE" },
    orderBy: [{ group: "asc" }, { createdAt: "asc" }],
    take,
  });
}

export async function getReceivableTotal(teamId: string): Promise<number> {
  const payments = await db.incomePayment.findMany({
    where: { incomeSource: { teamId }, status: { in: ["PENDING", "OVERDUE", "PARTIAL"] } },
  });
  return payments.reduce((sum, p) => sum + Math.max(0, p.amountCents - p.receivedAmountCents), 0);
}

export async function getReceivedTotal(teamId: string): Promise<number> {
  const result = await db.movement.aggregate({
    where: { teamId, type: "INCOME_RECEIVED" },
    _sum: { amountCents: true },
  });
  return result._sum.amountCents ?? 0;
}

/**
 * Simplificación de fase inicial: lo "apartado" se aproxima con los
 * movimientos de tipo ADJUSTMENT categoría "Apartado". El sistema de
 * apartados con bolsa dedicada (sección 8 del brief) queda para una
 * fase posterior.
 */
export async function getReservedTotal(teamId: string): Promise<number> {
  const result = await db.movement.aggregate({
    where: { teamId, type: "ADJUSTMENT", category: "Apartado" },
    _sum: { amountCents: true },
  });
  return Math.abs(result._sum.amountCents ?? 0);
}

export async function getIncomeTotalsByType(teamId: string) {
  const sources = await db.incomeSource.findMany({
    where: { teamId },
    include: { payments: true },
  });

  const totals = { FIXED: 0, RECEIVABLE_CLIENT: 0, EXTRA: 0 } as Record<string, number>;
  for (const source of sources) {
    const received = source.payments.reduce((sum, p) => sum + p.receivedAmountCents, 0);
    totals[source.type] += received;
  }
  return totals;
}

export async function getNextCommitment(teamId: string) {
  const now = new Date();
  return db.commitmentInstance.findFirst({
    where: { teamId, status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
    orderBy: { dueDate: "asc" },
    include: { commitment: true },
  });
}
