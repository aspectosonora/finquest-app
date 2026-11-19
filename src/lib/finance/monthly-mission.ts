"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { completeChallenge } from "@/lib/finance/challenges-engine";
import { monthKey, currentMonthLabel } from "@/lib/date/month";

export type MonthlyMissionFormState = { error?: string } | null;

function monthStart(date: Date = new Date()) {
  const key = monthKey(date); // "2026-12"
  const [year, month] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

const schema = z.object({
  title: z.string().trim().min(1, "Falta el título de la misión."),
  description: z.string().trim().min(1, "Falta el objetivo de la misión."),
  xpReward: z.coerce.number().int().positive("El XP debe ser mayor a cero."),
});

export async function createMonthlyMissionAction(
  _prev: MonthlyMissionFormState,
  formData: FormData
): Promise<MonthlyMissionFormState> {
  const user = await requireCurrentUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const start = monthStart();
  const existing = await db.challenge.findFirst({
    where: { teamId: user.teamId, group: "MONTHLY", periodStart: start },
  });
  if (existing) return { error: "Ya configuraron la misión de este mes." };

  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  end.setUTCHours(23, 59, 59, 999);

  await db.challenge.create({
    data: {
      teamId: user.teamId,
      templateKey: `mensual_${monthKey()}`,
      title: parsed.data.title,
      description: parsed.data.description,
      group: "MONTHLY",
      xpReward: parsed.data.xpReward,
      status: "ACTIVE",
      periodStart: start,
      periodEnd: end,
    },
  });

  redirect("/retos?mision=1");
}

export async function markMonthlyMissionDoneAction(formData: FormData) {
  const user = await requireCurrentUser();
  const challengeId = String(formData.get("challengeId") ?? "");
  const challenge = await db.challenge.findFirst({
    where: { id: challengeId, teamId: user.teamId, group: "MONTHLY", status: "ACTIVE" },
  });
  if (challenge) {
    await completeChallenge(user.teamId, challenge.id, challenge.xpReward);
  }
  redirect("/retos");
}

export async function getCurrentMonthlyMission(teamId: string) {
  const start = monthStart();
  return db.challenge.findFirst({ where: { teamId, group: "MONTHLY", periodStart: start } });
}

export async function defaultMonthlyMissionTitle() {
  return `Misión ${currentMonthLabel()}`;
}
