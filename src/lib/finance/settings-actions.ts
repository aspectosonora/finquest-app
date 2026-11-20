"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { clampPercent } from "@/lib/finance/money";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type SettingsFormState = { error?: string } | null;

const teamNameSchema = z.object({
  name: z.string().trim().min(1, "Falta el nombre del equipo.").max(60),
});

export async function updateTeamNameAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const user = await requireCurrentUser();
  const parsed = teamNameSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa el nombre." };
  }
  await db.team.update({ where: { id: user.teamId }, data: { name: parsed.data.name } });
  redirect("/equipo/configuracion?guardado=1");
}

const avatarSchema = z.object({
  userId: z.string().min(1),
  avatarKey: z.enum(["JULIO", "CINTHYA", "CUSTOM"]),
});

export async function updateMemberAvatarAction(formData: FormData) {
  const user = await requireCurrentUser();
  const parsed = avatarSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;

  await db.user.updateMany({
    where: { id: parsed.data.userId, teamId: user.teamId },
    data: { avatarKey: parsed.data.avatarKey },
  });
  redirect("/equipo/configuracion");
}

const splitSchema = z.object({
  julioPercent: z.coerce.number().min(0).max(100),
});

export async function updateTeamSplitAction(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const user = await requireCurrentUser();
  if (user.team.members.length < 2) {
    return { error: "Falta que se una tu pareja al equipo." };
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

  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo/configuracion?reparto=1");
}
