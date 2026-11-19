import { requireCurrentUser } from "@/lib/auth/current-user";
import { getTeamDefaultSplit } from "@/lib/finance/split-query";
import { GOAL_CATEGORIES } from "@/lib/constants/goals";
import { NewGoalForm } from "./NewGoalForm";

export default async function NuevaMetaPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const user = await requireCurrentUser();
  const defaultSplit = await getTeamDefaultSplit(user.teamId);

  const members = user.team.members.map((m) => ({ id: m.id, name: m.name }));
  const defaultJulioPercent =
    defaultSplit?.shares.find((s) => s.userId === members[0]?.id)?.percent ?? 65;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Nueva meta</h1>
        <p className="text-ink/60">Construyan juntos su próximo objetivo.</p>
      </div>
      <NewGoalForm
        categories={GOAL_CATEGORIES}
        defaultCategory={categoria}
        members={members}
        defaultJulioPercent={defaultJulioPercent}
        hasSplit={members.length === 2}
      />
    </div>
  );
}
