"use server";

import { requireCurrentUser } from "@/lib/auth/current-user";
import { markWeeklyChallengeDone } from "@/lib/finance/weekly-challenges";
import type { CompleteChallengeResult } from "@/lib/finance/challenges-engine";

export async function markWeeklyChallengeDoneAction(
  _prev: CompleteChallengeResult | null,
  formData: FormData
): Promise<CompleteChallengeResult | null> {
  const user = await requireCurrentUser();
  const challengeId = String(formData.get("challengeId") ?? "");
  return markWeeklyChallengeDone(user.teamId, challengeId);
}
