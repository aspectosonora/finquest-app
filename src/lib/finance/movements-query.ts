import "server-only";

import { db } from "@/lib/db";

export async function listRecentMovements(teamId: string, take = 50) {
  const [movements, budgetCategories] = await Promise.all([
    db.movement.findMany({
      where: { teamId },
      include: { user: true },
      orderBy: { occurredAt: "desc" },
      take,
    }),
    db.budgetCategory.findMany({ where: { teamId } }),
  ]);

  const budgetNameById = new Map(budgetCategories.map((b) => [b.id, b.name]));

  return movements.map((m) => ({
    ...m,
    budgetCategoryName: m.relatedBudgetCategoryId
      ? (budgetNameById.get(m.relatedBudgetCategoryId) ?? null)
      : null,
  }));
}

export const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  INCOME_RECEIVED: "Ingreso cobrado",
  EXPENSE: "Gasto",
  DEBT_PAYMENT: "Abono a deuda",
  GOAL_CONTRIBUTION: "Aportación a meta",
  SALARY_RELEASE: "Sueldo liberado",
  REWARD_CHEST_PAYOUT: "Cofre del tesoro",
  ADJUSTMENT: "Ajuste / apartado",
};
