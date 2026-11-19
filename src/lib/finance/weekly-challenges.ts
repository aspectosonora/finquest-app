import "server-only";

import { db } from "@/lib/db";
import { CHALLENGE_TEMPLATES } from "@/lib/constants/challenges";
import { currentWeekRange, weekKey } from "@/lib/date/week";
import { completeChallenge } from "@/lib/finance/challenges-engine";

const WEEKLY_TEMPLATES = CHALLENGE_TEMPLATES.filter((t) => t.group === "WEEKLY");

/** Claves de retos semanales que se autoverifican con datos reales. */
const AUTO_VERIFIED = new Set([
  "semanal_golpe_critico",
  "semanal_cofre_tesoro",
  "semanal_resistir_tentacion",
]);

/**
 * Crea (si faltan) los retos semanales de la semana en curso. Idempotente:
 * no duplica si ya existen para esa semana (clave templateKey + periodStart).
 */
export async function ensureWeeklyChallenges(teamId: string) {
  const { start, end } = currentWeekRange();

  const existing = await db.challenge.findMany({
    where: { teamId, group: "WEEKLY", periodStart: start },
    select: { templateKey: true },
  });
  const existingKeys = new Set(existing.map((c) => c.templateKey));

  const missing = WEEKLY_TEMPLATES.filter((t) => !existingKeys.has(t.key));
  if (missing.length === 0) return;

  await db.challenge.createMany({
    data: missing.map((template) => ({
      teamId,
      templateKey: template.key,
      title: template.title,
      description: template.description,
      group: "WEEKLY" as const,
      xpReward: template.xp ?? 0,
      targetCount: 1,
      status: "ACTIVE" as const,
      periodStart: start,
      periodEnd: end,
    })),
  });
}

/** Revisa los retos semanales autoverificables contra datos reales de esta semana. */
export async function evaluateWeeklyChallenges(teamId: string) {
  const { start, end } = currentWeekRange();

  const challenges = await db.challenge.findMany({
    where: {
      teamId,
      group: "WEEKLY",
      status: "ACTIVE",
      periodStart: start,
      templateKey: { in: Array.from(AUTO_VERIFIED) },
    },
  });
  if (challenges.length === 0) return;

  const [extraordinaryPayment, contribution, budgets] = await Promise.all([
    db.debtPayment.findFirst({
      where: { debt: { teamId }, isExtraordinary: true, paidAt: { gte: start, lte: end } },
    }),
    db.goalContribution.findFirst({
      where: { goal: { teamId }, contributedAt: { gte: start, lte: end } },
    }),
    db.budgetCategory.findMany({ where: { teamId } }),
  ]);

  let weeklySpendOk = false;
  if (budgets.length > 0) {
    const weeklyLimitCents = budgets.reduce((sum, b) => sum + Math.round(b.monthlyLimitCents / 4.345), 0);
    const spend = await db.movement.aggregate({
      where: {
        teamId,
        type: "EXPENSE",
        relatedBudgetCategoryId: { in: budgets.map((b) => b.id) },
        occurredAt: { gte: start, lte: end },
      },
      _sum: { amountCents: true },
    });
    const spentCents = Math.abs(spend._sum.amountCents ?? 0);
    weeklySpendOk = spentCents <= weeklyLimitCents;
  }

  const checks: Record<string, boolean> = {
    semanal_golpe_critico: Boolean(extraordinaryPayment),
    semanal_cofre_tesoro: Boolean(contribution),
    semanal_resistir_tentacion: weeklySpendOk,
  };

  for (const challenge of challenges) {
    if (!checks[challenge.templateKey]) continue;
    await completeChallenge(teamId, challenge.id, challenge.xpReward);
  }
}

/** Autorreporte del equipo para retos semanales de hábito (no medibles desde el ledger). */
export async function markWeeklyChallengeDone(teamId: string, challengeId: string) {
  const challenge = await db.challenge.findFirst({
    where: { id: challengeId, teamId, group: "WEEKLY", status: "ACTIVE" },
  });
  if (!challenge) return null;
  if (AUTO_VERIFIED.has(challenge.templateKey)) return null; // estos solo se completan por evidencia real
  return completeChallenge(teamId, challenge.id, challenge.xpReward);
}

export { AUTO_VERIFIED as WEEKLY_AUTO_VERIFIED, weekKey };
