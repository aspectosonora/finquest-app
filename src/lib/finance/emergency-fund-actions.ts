"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { pesosToCents } from "@/lib/finance/money";
import { evaluateInitialChallenges } from "@/lib/finance/challenges-engine";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type EmergencyFundFormState = { error?: string } | null;

const schema = z.object({
  targetAmount: z.coerce.number().positive("El objetivo debe ser mayor a cero."),
  redirectTo: z.string().optional().or(z.literal("")),
});

export async function createEmergencyFundGoalAction(
  _prev: EmergencyFundFormState,
  formData: FormData
): Promise<EmergencyFundFormState> {
  const user = await requireCurrentUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Revisa el monto." };
  }

  const redirectTo = parsed.data.redirectTo?.startsWith("/") ? parsed.data.redirectTo : "/onboarding?fondo=1";

  const existing = await db.goal.findFirst({ where: { teamId: user.teamId, category: "EMERGENCY_FUND" } });
  if (existing) {
    redirect(redirectTo);
  }

  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() + 1);

  await db.goal.create({
    data: {
      teamId: user.teamId,
      name: "Fondo de emergencia",
      category: "EMERGENCY_FUND",
      targetAmountCents: pesosToCents(parsed.data.targetAmount),
      mode: "BY_DATE",
      targetDate,
    },
  });

  await evaluateInitialChallenges(user.teamId);
  updateTag(FINANCE_CACHE_TAG);
  redirect(redirectTo);
}
