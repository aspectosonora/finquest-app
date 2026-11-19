import "server-only";

import { db } from "@/lib/db";

export async function listActiveGoals(teamId: string) {
  const goals = await db.goal.findMany({
    where: { teamId, isCompleted: false },
    include: { contributions: true },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return goals.map((goal) => ({
    ...goal,
    accumulatedCents: goal.contributions.reduce((sum, c) => sum + c.amountCents, 0),
  }));
}

export async function listCompletedGoals(teamId: string) {
  return db.goal.findMany({
    where: { teamId, isCompleted: true },
    include: { contributions: true },
    orderBy: { completedAt: "desc" },
  });
}

export async function getGoalById(teamId: string, goalId: string) {
  const goal = await db.goal.findFirst({
    where: { id: goalId, teamId },
    include: { contributions: { include: { user: true }, orderBy: { contributedAt: "desc" } } },
  });
  if (!goal) return null;
  const accumulatedCents = goal.contributions.reduce((sum, c) => sum + c.amountCents, 0);
  return { ...goal, accumulatedCents };
}
