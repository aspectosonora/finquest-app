import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listActiveGoals, listCompletedGoals } from "@/lib/finance/goals-query";
import { getTeamDefaultSplitCached as getTeamDefaultSplit } from "@/lib/finance/dashboard-cached";
import { calculateGoal } from "@/lib/finance/goal-calc";
import { formatCents } from "@/lib/finance/money";
import { GOAL_CATEGORIES, GOAL_ACHIEVEMENTS_ILLUSTRATION } from "@/lib/constants/goals";
import { privateFileUrl } from "@/lib/storage/url";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RibbonTag } from "@/components/ui/RibbonTag";
import { DiagonalLines } from "@/components/ui/DiagonalLines";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { Avatar } from "@/components/ui/Avatar";
import { CelebrationFromQuery } from "@/components/effects/CelebrationFromQuery";

export default async function MetasPage() {
  const user = await requireCurrentUser();
  const [activeGoals, completedGoals, defaultSplit] = await Promise.all([
    listActiveGoals(user.teamId),
    listCompletedGoals(user.teamId),
    getTeamDefaultSplit(user.teamId),
  ]);

  const primaryGoal = activeGoals.find((g) => g.isPrimary) ?? activeGoals[0] ?? null;
  const otherGoals = activeGoals.filter((g) => g.id !== primaryGoal?.id);

  const shares = (defaultSplit?.shares ?? []).map((s) => ({ userId: s.userId, percent: s.percent }));
  const membersById = Object.fromEntries(user.team.members.map((m) => [m.id, m.name]));
  const memberMetaById = Object.fromEntries(user.team.members.map((m) => [m.id, m]));

  const primaryCalc =
    primaryGoal && shares.length === 2
      ? calculateGoal({
          targetAmountCents: primaryGoal.targetAmountCents,
          accumulatedCents: primaryGoal.accumulatedCents,
          mode: primaryGoal.mode,
          remainingInstallments: primaryGoal.targetDate
            ? monthsBetween(new Date(), primaryGoal.targetDate)
            : null,
          monthlyBudgetCents: primaryGoal.monthlyBudgetCents,
          shares,
        })
      : null;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <Suspense fallback={null}>
        <CelebrationFromQuery />
      </Suspense>
      <div className="relative -mx-4 flex h-24 items-center overflow-hidden">
        <div className="relative z-10 min-w-0 flex-1 pl-4 pr-4">
          <Image src="/assets/titulos/titulo_metas.png" alt="Metas" width={239} height={44} priority />
          <p className="mt-1 text-sm text-ink/60">Nuestro futuro se construye en equipo.</p>
        </div>
        <div
          className="absolute right-0 top-0 flex h-full w-24 shrink-0 items-center justify-center bg-electric"
          style={{ clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)" }}
        >
          <MaskIcon src="/assets/navegacion/svg/metas.svg" size={28} className="bg-white" />
        </div>
      </div>

      {primaryGoal ? (
        <Card className="clip-br-lg overflow-hidden !p-0">
          <div className="relative">
            <RibbonTag className="absolute left-0 top-3 z-10">Misión principal</RibbonTag>
            {primaryGoal.photoUrl ? (
              <Image
                src={privateFileUrl(primaryGoal.photoUrl)}
                alt={primaryGoal.name}
                width={640}
                height={360}
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-32 w-full items-center justify-center bg-mist-soft text-ink/30">
                Sin foto todavía
              </div>
            )}
          </div>
          <div className="p-4">
            <h2 className="fq-title text-2xl uppercase text-ink">
              <span>{primaryGoal.name}</span>
            </h2>
            <div className="mt-2 flex items-start justify-between gap-3">
              <span className="font-sans text-2xl font-extrabold leading-tight text-ink">
                {formatCents(primaryGoal.accumulatedCents)}
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wide text-ink/50">
                  Ahorrados
                </span>
              </span>
              <span className="text-right font-sans text-2xl font-extrabold leading-tight text-ink">
                {formatCents(primaryGoal.targetAmountCents)}
                <span className="block font-sans text-[10px] font-bold uppercase tracking-wide text-ink/50">
                  Meta
                </span>
              </span>
            </div>
            <ProgressBar percent={(primaryGoal.accumulatedCents / primaryGoal.targetAmountCents) * 100} className="mt-2" />

            {primaryCalc && (
              <div className="clip-br relative mt-4 overflow-hidden bg-electric p-4 text-white">
                <DiagonalLines className="right-0 top-0 h-16 w-24" />
                <div className="relative flex items-center justify-between">
                  <p className="fq-title text-lg uppercase">
                    <span>Plan de ahorro</span>
                  </p>
                  <Link
                    href={`/metas/${primaryGoal.id}`}
                    className="flex items-center gap-1 rounded-full bg-white px-3 py-1 font-sans text-[11px] font-bold text-electric"
                  >
                    Editar plan
                  </Link>
                </div>
                <p className="relative mt-1 font-sans text-2xl font-extrabold">
                  {formatCents(primaryCalc.monthlyRequiredCents)} al mes
                </p>
                {primaryCalc.perMember.length === 2 && (
                  <div className="relative mt-3 flex h-7 overflow-hidden rounded-full">
                    <div
                      className="flex items-center justify-center bg-white font-sans text-xs font-extrabold text-electric"
                      style={{ width: `${primaryCalc.perMember[0].percent}%` }}
                    >
                      {primaryCalc.perMember[0].percent}%
                    </div>
                    <div className="flex flex-1 items-center justify-center bg-orange font-sans text-xs font-extrabold text-white">
                      {primaryCalc.perMember[1].percent}%
                    </div>
                  </div>
                )}
                <div className="relative mt-4 flex items-center gap-3">
                  {primaryCalc.perMember.map((share) => {
                    const member = memberMetaById[share.userId];
                    return (
                      <div key={share.userId} className="flex min-w-0 flex-1 items-center gap-1.5">
                        {member && (
                          <Avatar
                            avatarKey={member.avatarKey}
                            avatarUrl={member.avatarUrl}
                            name={member.name}
                            size={36}
                            className="shrink-0 border-2 border-white/40"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-sans text-[10px] font-bold uppercase text-white/80">
                            {membersById[share.userId]} · {share.percent}%
                          </p>
                          <p className="truncate font-sans text-sm font-extrabold">
                            {formatCents(share.amountCents)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <ButtonLink href={`/metas/${primaryGoal.id}`} variant="primary" className="relative mt-4">
                  Registrar aportación →
                </ButtonLink>
              </div>
            )}

            {!primaryCalc && (
              <ButtonLink href={`/metas/${primaryGoal.id}`} variant="primary" className="mt-4">
                Registrar aportación →
              </ButtonLink>
            )}
          </div>
        </Card>
      ) : (
        <Card className="clip-br-lg overflow-hidden !p-0">
          <div className="relative bg-electric px-4 pb-6 pt-4 text-white">
            <DiagonalLines className="right-0 top-0 h-20 w-28" />
            <RibbonTag>Misión principal</RibbonTag>
            <h2 className="fq-title relative mt-3 text-2xl uppercase">
              <span>Aún no tienen una misión</span>
            </h2>
            <p className="relative mt-1 text-sm text-white/80">
              Creen su primera meta en equipo para empezar a construir su futuro.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 px-4 py-5">
            <MaskIcon src="/assets/navegacion/svg/metas.svg" size={36} className="bg-electric/30" />
            <ButtonLink href="/metas/nueva" variant="primary" className="w-full">
              Crear mi primera meta →
            </ButtonLink>
          </div>
        </Card>
      )}

      {otherGoals.length > 0 && (
        <section className="flex flex-col gap-2">
          <SectionHeading>Otras metas activas</SectionHeading>
          {otherGoals.map((goal) => (
            <Link key={goal.id} href={`/metas/${goal.id}`}>
              <Card className="flex items-center justify-between">
                <span className="font-heading font-bold">{goal.name}</span>
                <span className="text-sm text-ink/60">
                  {formatCents(goal.accumulatedCents)} / {formatCents(goal.targetAmountCents)}
                </span>
              </Card>
            </Link>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <SectionHeading>Crea tu próxima meta</SectionHeading>
        <div className="grid grid-cols-2 gap-[7px]">
          {GOAL_CATEGORIES.map((cat) => (
            <Link key={cat.category} href={`/metas/nueva?categoria=${cat.category}`}>
              <div className="clip-br relative flex h-[76px] overflow-hidden rounded-xl bg-white">
                <div className="relative z-10 flex w-[44%] shrink-0 flex-col justify-between py-2.5 pl-3">
                  <span className="fq-title text-[13px] uppercase leading-[0.95] text-ink">
                    <span>{cat.label}</span>
                  </span>
                  <span className="font-sans text-lg font-extrabold leading-none text-electric">→</span>
                </div>
                <div className="relative min-w-0 flex-1">
                  <Image
                    src={cat.illustration}
                    alt=""
                    fill
                    sizes="130px"
                    className="object-cover object-right"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="flex items-center gap-3 rounded-xl border border-mist bg-white p-3">
        <Image src={GOAL_ACHIEVEMENTS_ILLUSTRATION} alt="" width={40} height={40} />
        <div>
          <p className="font-heading font-extrabold uppercase">Logros en equipo</p>
          <p className="text-sm text-ink/60">
            {completedGoals.length === 0
              ? "0 metas cumplidas"
              : `${completedGoals.length} meta${completedGoals.length === 1 ? "" : "s"} cumplida${completedGoals.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </section>
    </div>
  );
}

function monthsBetween(from: Date, to: Date) {
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(0, months);
}
