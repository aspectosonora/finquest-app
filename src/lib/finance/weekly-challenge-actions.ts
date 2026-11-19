"use server";

import { redirect } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { markWeeklyChallengeDone } from "@/lib/finance/weekly-challenges";

export async function markWeeklyChallengeDoneAction(formData: FormData) {
  const user = await requireCurrentUser();
  const challengeId = String(formData.get("challengeId") ?? "");
  await markWeeklyChallengeDone(user.teamId, challengeId);
  redirect("/retos");
}
