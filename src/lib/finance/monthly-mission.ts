"use server";

import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { completeChallenge, type CompleteChallengeResult } from "@/lib/finance/challenges-engine";
import { monthKey } from "@/lib/date/month";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

const MONEY_DATE_CHECKLIST =
  "Siéntense juntos este mes: 1) revisen los gastos del mes, 2) vean el avance de sus metas, 3) decidan algo juntos.";
const MONEY_DATE_XP_REWARD = 300;

function monthStart(date: Date = new Date()) {
  const key = monthKey(date); // "2026-12"
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

/**
 * La "Cita del dinero": ritual mensual fijo (no configurable) que aparece
 * automáticamente en Retos cada mes, en vez de requerir que el equipo
 * capture su propia misión a mano.
 */
export async function ensureMoneyDateMission(teamId: string) {
  const start = monthStart();
  const existing = await db.challenge.findFirst({
    where: { teamId, group: "MONTHLY", periodStart: start },
  });
  if (existing) return existing;

  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  end.setUTCHours(23, 59, 59, 999);

  return db.challenge.create({
    data: {
      teamId,
      templateKey: `cita_del_dinero_${monthKey()}`,
      title: "Cita del dinero",
      description: MONEY_DATE_CHECKLIST,
      group: "MONTHLY",
      xpReward: MONEY_DATE_XP_REWARD,
      status: "ACTIVE",
      periodStart: start,
      periodEnd: end,
    },
  });
}

export async function markMonthlyMissionDoneAction(
  _prev: CompleteChallengeResult | null,
  formData: FormData
): Promise<CompleteChallengeResult | null> {
  const user = await requireCurrentUser();
  const challengeId = String(formData.get("challengeId") ?? "");
  const challenge = await db.challenge.findFirst({
    where: { id: challengeId, teamId: user.teamId, group: "MONTHLY", status: "ACTIVE" },
  });
  if (!challenge) return null;
  const result = await completeChallenge(user.teamId, challenge.id, challenge.xpReward);
  updateTag(FINANCE_CACHE_TAG);
  return result;
}
