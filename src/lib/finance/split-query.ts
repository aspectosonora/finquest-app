import "server-only";

import { db } from "@/lib/db";

export async function getTeamDefaultSplit(teamId: string) {
  return db.split.findFirst({
    where: { teamId, scope: "TEAM_DEFAULT" },
    orderBy: { effectiveFrom: "desc" },
    include: { shares: true },
  });
}

export async function getGoalSplitOverride(goalId: string) {
  return db.split.findFirst({
    where: { goalId, scope: "GOAL" },
    orderBy: { effectiveFrom: "desc" },
    include: { shares: true },
  });
}
