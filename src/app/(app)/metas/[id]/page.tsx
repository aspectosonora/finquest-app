import { notFound } from "next/navigation";
import Image from "next/image";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getGoalById } from "@/lib/finance/goals-query";
import { setPrimaryGoalAction } from "@/lib/finance/goal-actions";
import { formatCents } from "@/lib/finance/money";
import { goalCategoryMeta } from "@/lib/constants/goals";
import { privateFileUrl } from "@/lib/storage/url";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ContributeForm } from "./ContributeForm";

export default async function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireCurrentUser();
  const goal = await getGoalById(user.teamId, id);
  if (!goal) notFound();

  const meta = goalCategoryMeta(goal.category);

  return (
    <div className="flex flex-col gap-5 pt-2">
      {goal.photoUrl ? (
        <Image
          src={privateFileUrl(goal.photoUrl)}
          alt={goal.name}
          width={640}
          height={320}
          className="h-44 w-full rounded-2xl object-cover"
        />
      ) : meta ? (
        <Image src={meta.illustration} alt="" width={200} height={140} className="mx-auto object-contain" />
      ) : null}

      <div>
        <h1 className="font-display text-3xl text-ink">{goal.name}</h1>
        {goal.isCompleted && (
          <p className="font-heading font-bold text-electric">¡Meta cumplida!</p>
        )}
      </div>

      <Card>
        <div className="flex items-baseline justify-between">
          <span className="font-heading text-2xl font-extrabold">{formatCents(goal.accumulatedCents)}</span>
          <span className="text-ink/60">meta {formatCents(goal.targetAmountCents)}</span>
        </div>
        <ProgressBar percent={(goal.accumulatedCents / goal.targetAmountCents) * 100} className="mt-2" />
      </Card>

      {!goal.isPrimary && !goal.isCompleted && (
        <form action={setPrimaryGoalAction}>
          <input type="hidden" name="goalId" value={goal.id} />
          <button type="submit" className="text-center font-heading font-bold text-electric underline">
            Marcar como misión principal
          </button>
        </form>
      )}

      {!goal.isCompleted && (
        <ContributeForm goalId={goal.id} members={user.team.members.map((m) => ({ id: m.id, name: m.name }))} />
      )}

      <div>
        <h2 className="font-heading text-lg font-extrabold uppercase">Historial de aportaciones</h2>
        {goal.contributions.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50">Todavía no hay aportaciones registradas.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {goal.contributions.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                <span>{c.user?.name ?? "Equipo"}</span>
                <span className="font-bold">{formatCents(c.amountCents)}</span>
                <span className="text-ink/50">
                  {new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(c.contributedAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
