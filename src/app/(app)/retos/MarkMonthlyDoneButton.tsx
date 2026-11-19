import { markMonthlyMissionDoneAction } from "@/lib/finance/monthly-mission";

export function MarkMonthlyDoneButton({ challengeId }: { challengeId: string }) {
  return (
    <form action={markMonthlyMissionDoneAction}>
      <input type="hidden" name="challengeId" value={challengeId} />
      <button type="submit" className="text-xs font-bold text-electric underline">
        Marcar como cumplida
      </button>
    </form>
  );
}
