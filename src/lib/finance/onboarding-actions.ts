"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { clampPercent } from "@/lib/finance/money";
import { evaluateInitialChallenges } from "@/lib/finance/challenges-engine";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type OnboardingFormState = { error?: string } | null;

const splitSchema = z.object({
  julioPercent: z.coerce.number().min(0).max(100),
});

export async function setTeamSplitAction(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const user = await requireCurrentUser();
  if (user.team.members.length < 2) {
    return { error: "Esperen a que su pareja se una al equipo con el código de invitación." };
  }

  const parsed = splitSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Revisa el porcentaje." };
  }

  const julioPercent = clampPercent(parsed.data.julioPercent);
  const [first, second] = user.team.members;

  await db.split.create({
    data: {
      teamId: user.teamId,
      scope: "TEAM_DEFAULT",
      shares: {
        create: [
          { userId: first.id, percent: julioPercent },
          { userId: second.id, percent: 100 - julioPercent },
        ],
      },
    },
  });

  await db.team.update({
    where: { id: user.teamId },
    data: { onboardingStep: Math.max(user.team.onboardingStep, 2) },
  });

  updateTag(FINANCE_CACHE_TAG);
  redirect("/onboarding?paso=3");
}

export async function finishOnboardingAction() {
  const user = await requireCurrentUser();
  await db.team.update({
    where: { id: user.teamId },
    data: { onboardingCompletedAt: new Date() },
  });
  await evaluateInitialChallenges(user.teamId);
  redirect("/inicio?bienvenida=1");
}

export async function regenerateInviteCodeAction(formData: FormData) {
  const user = await requireCurrentUser();
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  await db.team.update({
    where: { id: user.teamId },
    data: { inviteCode: crypto.randomUUID(), inviteCodeExpiresAt: expires },
  });
  const returnTo = String(formData.get("returnTo") ?? "/onboarding");
  redirect(returnTo.startsWith("/") ? returnTo : "/onboarding");
}
