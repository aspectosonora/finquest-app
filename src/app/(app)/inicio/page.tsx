import Image from "next/image";
import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  getAvailableTodayCached as getAvailableToday,
  getTeamXpCached as getTeamXp,
  getPersonalFreeMoneyCached as getPersonalFreeMoney,
  getTeamSavingsCached as getTeamSavings,
  getPrimaryGoalCached as getPrimaryGoal,
  getActiveBossCached as getActiveBoss,
  getUpcomingChallengesCached as getUpcomingChallenges,
} from "@/lib/finance/dashboard-cached";
import { levelForXp } from "@/lib/constants/challenges";
import { formatCents } from "@/lib/finance/money";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { KoBar } from "@/components/ui/KoBar";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { CornerAccent } from "@/components/ui/CornerAccent";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { DiagonalLines } from "@/components/ui/DiagonalLines";
import { RibbonTag } from "@/components/ui/RibbonTag";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { debtCategoryMeta } from "@/lib/constants/debts";
import { timed } from "@/lib/perf/timing";

export default async function InicioPage() {
  const pageStart = Date.now();
  const user = await requireCurrentUser();
  const teamId = user.teamId;
  const members = user.team.members;

  const [available, xp, savings, primaryGoal, activeBoss, upcomingChallenges, freeMoneyByMember] =
    await timed("inicio.dataPromiseAll", () =>
      Promise.all([
        getAvailableToday(teamId),
        getTeamXp(teamId),
        getTeamSavings(teamId),
        getPrimaryGoal(teamId),
        getActiveBoss(teamId),
        getUpcomingChallenges(teamId, 2),
        Promise.all(members.map((m) => getPersonalFreeMoney(m.id))),
      ])
    );
  console.log(`[perf] inicio.beforeRender ${Date.now() - pageStart}ms`);

  const { level, currentThreshold, nextThreshold } = levelForXp(xp);
  const xpIntoLevel = xp - currentThreshold;
  const xpForLevel = (nextThreshold ?? currentThreshold) - currentThreshold || 1;
  const levelPercent = nextThreshold ? (xpIntoLevel / xpForLevel) * 100 : 100;
  const activeBossMeta = activeBoss ? debtCategoryMeta(activeBoss.category) : null;

  return (
    <div className="flex flex-col pt-1">
      <Card
        className="clip-br-lg relative mx-[-3px] flex flex-col justify-center overflow-hidden !border-0 bg-electric px-5 text-white"
        style={{ height: 129 }}
      >
        <DiagonalLines className="right-0 top-0 h-28 w-36" />
        <p className="font-sans text-sm font-bold uppercase tracking-[0.18em] text-white/80">
          Disponible hoy
        </p>
        <p className="font-display text-[80px] italic leading-none tracking-wide">
          <AnimatedNumber value={available} />
        </p>
      </Card>

      <div className="mt-2 flex items-center gap-3">
        <span
          className="flex shrink-0 items-center justify-center rounded-md bg-ink text-center font-heading text-[11px] font-extrabold leading-tight text-white"
          style={{ width: 43, height: 43, clipPath: "polygon(15% 0,85% 0,100% 50%,85% 100%,15% 100%,0% 50%)" }}
        >
          NV
          <br />
          {level}
        </span>
        <div className="flex-1">
          <div className="flex items-baseline justify-between">
            <span className="font-sans text-lg font-extrabold text-ink">Nivel {level}</span>
            <span className="font-sans text-sm text-ink/60">
              {xpIntoLevel} / {xpForLevel} XP
            </span>
          </div>
          <ProgressBar percent={levelPercent} trackClassName="h-3" />
        </div>
      </div>

      <section className="mt-4 flex flex-col gap-3">
        <SectionHeading>Tu equipo</SectionHeading>
        <div className="grid grid-cols-2 gap-[9px]">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="relative h-[112px] overflow-hidden rounded-2xl border border-mist bg-white"
            >
              <CornerAccent color="electric" width={43} height={52} />
              <Avatar
                avatarKey={member.avatarKey}
                avatarUrl={member.avatarUrl}
                name={member.name}
                size={100}
                className="absolute bottom-0 left-0"
              />
              <div className="absolute bottom-2.5 right-1 flex min-w-0 flex-col" style={{ left: 88 }}>
                <p className="truncate font-sans text-[18px] font-extrabold leading-tight tracking-tight text-ink">
                  {member.name}
                </p>
                <p className="whitespace-nowrap font-sans text-[9px] font-medium uppercase leading-tight tracking-normal text-ink/50">
                  Dinero libre
                </p>
                <p className="truncate font-sans text-[23px] font-extrabold leading-tight text-ink">
                  <AnimatedNumber value={freeMoneyByMember[index] ?? 0} />
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="relative mt-3 flex h-16 items-center overflow-hidden rounded-2xl border border-mist bg-white px-3">
        <CornerAccent color="electric" size={26} />
        <div className="flex items-center gap-2.5">
          <Image src="/assets/interfaz/png/ahorro.png" alt="" width={38} height={36} />
          <div>
            <p className="font-sans text-sm font-bold leading-tight text-ink">Ahorro</p>
            <p className="font-sans text-[28px] font-extrabold leading-tight text-ink">
              <AnimatedNumber value={savings} />
            </p>
          </div>
        </div>
        <span className="mx-3 h-8 w-px shrink-0 bg-mist" aria-hidden />
        <p className="relative ml-auto max-w-[110px] truncate text-right font-sans text-sm text-ink/50">
          {primaryGoal ? primaryGoal.name : "Sin meta activa"}
        </p>
      </div>

      <section className="mt-4 flex flex-col gap-3">
        <SectionHeading>Próximos retos</SectionHeading>
        {upcomingChallenges.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-2 text-ink/40">
            <MaskIcon src="/assets/navegacion/svg/metas.svg" size={18} className="bg-ink/30" />
            <span className="font-sans text-sm font-bold">No hay misiones pendientes</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {upcomingChallenges.map((challenge) => (
              <Card key={challenge.id} className="flex items-center justify-between">
                <span className="font-sans font-bold text-ink">{challenge.title}</span>
                <span className="font-sans text-sm font-extrabold text-orange">
                  +{challenge.xpReward} XP
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="mt-4 flex flex-col gap-3">
        {activeBoss ? (
          <Card className="clip-br-lg relative overflow-hidden !border-0 bg-electric p-4 text-white">
            {!activeBossMeta && <DiagonalLines className="right-0 top-0 h-20 w-28" />}
            <div className="min-w-0 pr-20">
              <RibbonTag>Jefe activo</RibbonTag>
              <h2 className="fq-title mt-1.5 text-2xl uppercase text-white">
                <span>{activeBoss.name}</span>
              </h2>
              <p className="font-sans text-lg font-bold">{formatCents(activeBoss.balanceCents)} restantes</p>
            </div>
            {activeBossMeta && (
              <Image
                src={activeBossMeta.illustration}
                alt=""
                width={110}
                height={110}
                className="absolute -right-3 top-2 object-contain"
              />
            )}
            <div className="relative mt-2">
              <KoBar
                percent={
                  activeBoss.initialAmountCents > 0
                    ? 100 - (activeBoss.balanceCents / activeBoss.initialAmountCents) * 100
                    : 0
                }
                status="ACTIVE"
              />
            </div>
          </Card>
        ) : (
          <Link href="/deudas">
            <EmptyState
              title="Sin jefes activos"
              description={`Configuren sus deudas (${debtCategoryMeta("LIVERPOOL")?.defaultName}, tarjetas, préstamos...) para empezar la batalla.`}
            />
          </Link>
        )}
      </section>
    </div>
  );
}
