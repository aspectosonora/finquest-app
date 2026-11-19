import "server-only";

import { db } from "@/lib/db";
import { monthKey } from "@/lib/date/month";

function currentMonthRange() {
  const key = monthKey();
  const [year, month] = key.split("-").map(Number);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start, end };
}

export async function listBudgetsWithUsage(teamId: string) {
  const { start, end } = currentMonthRange();
  const categories = await db.budgetCategory.findMany({
    where: { teamId },
    orderBy: { createdAt: "asc" },
  });

  const movements = await db.movement.findMany({
    where: {
      teamId,
      type: "EXPENSE",
      relatedBudgetCategoryId: { in: categories.map((c) => c.id) },
      occurredAt: { gte: start, lte: end },
    },
  });

  return categories.map((category) => {
    const usedCents = movements
      .filter((m) => m.relatedBudgetCategoryId === category.id)
      .reduce((sum, m) => sum + Math.abs(m.amountCents), 0);
    const percent =
      category.monthlyLimitCents > 0
        ? Math.min(100, Math.round((usedCents / category.monthlyLimitCents) * 100))
        : 0;
    return { ...category, usedCents, percent };
  });
}
