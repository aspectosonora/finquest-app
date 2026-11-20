"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { pesosToCents } from "@/lib/finance/money";
import { evaluateInitialChallenges } from "@/lib/finance/challenges-engine";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type BudgetFormState = { error?: string } | null;

const schema = z.object({
  name: z.string().trim().min(1, "Falta el nombre de la categoría."),
  monthlyLimit: z.coerce.number().positive("El presupuesto debe ser mayor a cero."),
  icon: z.string().trim().optional().or(z.literal("")),
});

export async function createBudgetCategoryAction(
  _prev: BudgetFormState,
  formData: FormData
): Promise<BudgetFormState> {
  const user = await requireCurrentUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  await db.budgetCategory.create({
    data: {
      teamId: user.teamId,
      name: parsed.data.name,
      monthlyLimitCents: pesosToCents(parsed.data.monthlyLimit),
      icon: parsed.data.icon || null,
    },
  });

  await evaluateInitialChallenges(user.teamId);
  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo/presupuestos?creado=1");
}

export async function deleteBudgetCategoryAction(formData: FormData) {
  const user = await requireCurrentUser();
  const id = String(formData.get("id") ?? "");
  await db.budgetCategory.deleteMany({ where: { id, teamId: user.teamId } });
  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo/presupuestos");
}
