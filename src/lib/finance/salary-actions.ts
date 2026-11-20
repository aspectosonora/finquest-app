"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { pesosToCents } from "@/lib/finance/money";
import { optionalNumber } from "@/lib/validation/zod-helpers";
import { updateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

export type SalaryFormState = { error?: string } | null;

const schema = z.object({
  julioAmount: optionalNumber(z.coerce.number().min(0)),
  cinthyaAmount: optionalNumber(z.coerce.number().min(0)),
});

export async function setPersonalSalariesAction(
  _prev: SalaryFormState,
  formData: FormData
): Promise<SalaryFormState> {
  const user = await requireCurrentUser();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: "Revisa los importes." };
  }
  if (user.team.members.length < 2) {
    return { error: "Falta que se una tu pareja al equipo." };
  }

  const [first, second] = user.team.members;
  const amounts: Record<string, number> = {
    [first.id]: pesosToCents(parsed.data.julioAmount ?? 0),
    [second.id]: pesosToCents(parsed.data.cinthyaAmount ?? 0),
  };

  await db.$transaction(
    Object.entries(amounts).map(([userId, desiredAmountCents]) =>
      db.personalSalaryConfig.upsert({
        where: { userId },
        update: { desiredAmountCents },
        create: { teamId: user.teamId, userId, desiredAmountCents },
      })
    )
  );

  updateTag(FINANCE_CACHE_TAG);
  redirect("/equipo?sueldos=1");
}
