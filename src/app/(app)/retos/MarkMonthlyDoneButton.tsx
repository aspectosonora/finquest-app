import { markMonthlyMissionDoneAction } from "@/lib/finance/monthly-mission";
import { CompleteChallengeButton } from "@/components/ui/CompleteChallengeButton";

export function MarkMonthlyDoneButton({ challengeId }: { challengeId: string }) {
  return (
    <CompleteChallengeButton
      action={markMonthlyMissionDoneAction}
      challengeId={challengeId}
      label="Marcar como cumplida"
    />
  );
}
