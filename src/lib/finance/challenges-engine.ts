import "server-only";

import { db } from "@/lib/db";
import { levelForXp } from "@/lib/constants/challenges";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

/**
 * Revisa los retos iniciales del equipo contra datos reales y completa
 * (otorgando XP una sola vez) los que ya se cumplieron. Nunca marca un
 * reto como completado por falta de datos: solo por evidencia real o por
 * confirmación explícita (status NOT_APPLICABLE, ver markChallengeNotApplicable).
 */
export async function evaluateInitialChallenges(teamId: string) {
  const [incomeCount, debtsConfigured, budgetCount, goalCount, contributionCount, team] =
    await Promise.all([
      db.incomeSource.count({ where: { teamId } }),
      db.debt.count({ where: { teamId, status: { not: "UNCONFIGURED" } } }),
      db.budgetCategory.count({ where: { teamId } }),
      db.goal.count({ where: { teamId } }),
      db.goalContribution.count({ where: { goal: { teamId } } }),
      db.team.findUnique({ where: { id: teamId }, select: { onboardingCompletedAt: true } }),
    ]);

  const checks: Record<string, boolean> = {
    inicial_primer_paso: incomeCount > 0,
    inicial_conoce_al_enemigo: debtsConfigured > 0,
    inicial_plan_de_batalla: budgetCount > 0,
    inicial_nuestra_primera_meta: goalCount > 0,
    inicial_primer_escudo: contributionCount > 0,
    inicial_equipo_completo: Boolean(team?.onboardingCompletedAt),
  };

  const challenges = await db.challenge.findMany({
    where: { teamId, group: "INITIAL", status: "ACTIVE" },
  });

  for (const challenge of challenges) {
    if (!checks[challenge.templateKey]) continue;
    await completeChallenge(teamId, challenge.id, challenge.xpReward);
  }
}

export type CompleteChallengeResult = { leveledUp: boolean; newLevel: number };

export async function completeChallenge(
  teamId: string,
  challengeId: string,
  xpReward: number
): Promise<CompleteChallengeResult> {
  return db.$transaction(async (tx) => {
    const xpBefore = (await tx.xpAward.aggregate({ where: { teamId }, _sum: { amount: true } }))._sum
      .amount ?? 0;
    const levelBefore = levelForXp(xpBefore).level;

    const challenge = await tx.challenge.update({
      where: { id: challengeId },
      data: { status: "COMPLETED", completedAt: new Date(), progressCount: 1 },
    });

    await tx.xpAward.upsert({
      where: { challengeId },
      update: {},
      create: { teamId, challengeId, amount: xpReward },
    });

    await tx.badge.upsert({
      where: { teamId_badgeKey_sourceId: { teamId, badgeKey: challenge.templateKey, sourceId: challengeId } },
      update: {},
      create: {
        teamId,
        badgeKey: challenge.templateKey,
        title: challenge.title,
        sourceType: "CHALLENGE",
        sourceId: challengeId,
      },
    });

    const levelAfter = levelForXp(xpBefore + xpReward).level;
    return { leveledUp: levelAfter > levelBefore, newLevel: levelAfter };
  }).then((result) => {
    updateTag(FINANCE_CACHE_TAG);
    return result;
  });
}

export async function markChallengeNotApplicable(teamId: string, challengeId: string) {
  await db.challenge.updateMany({
    where: { id: challengeId, teamId, group: "INITIAL" },
    data: { status: "NOT_APPLICABLE" },
  });
  updateTag(FINANCE_CACHE_TAG);
}
