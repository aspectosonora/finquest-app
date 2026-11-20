import Image from "next/image";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { getTeamXpCached as getTeamXp } from "@/lib/finance/dashboard-cached";
import { levelForXp } from "@/lib/constants/challenges";
import { markChallengeNotApplicable } from "@/lib/finance/challenges-engine";
import { markWeeklyChallengeDoneAction } from "@/lib/finance/weekly-challenge-actions";
import { ensureWeeklyChallenges, WEEKLY_AUTO_VERIFIED } from "@/lib/finance/weekly-challenges";
import { getCurrentMonthlyMission } from "@/lib/finance/monthly-mission";
import { currentMonthLabel } from "@/lib/date/month";
import { currentWeekRange } from "@/lib/date/week";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { RibbonTag } from "@/components/ui/RibbonTag";
import { DiagonalLines } from "@/components/ui/DiagonalLines";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/cn";
import { CompleteChallengeButton } from "@/components/ui/CompleteChallengeButton";
import { MonthlyMissionForm } from "./MonthlyMissionForm";
import { MarkMonthlyDoneButton } from "./MarkMonthlyDoneButton";

const HEADER_WEDGE_CLIP = "polygon(40% 0, 100% 0, 100% 100%, 0% 100%)";
const NV_HEX_CLIP = "polygon(15% 0,85% 0,100% 50%,85% 100%,15% 100%,0% 50%)";
const SEASON_ARROW_CLIP = "polygon(35% 0, 100% 0, 100% 100%, 0 100%)";
const ORANGE_TEMPLATE_KEYS = new Set(["semanal_golpe_critico", "semanal_contra_pronostico"]);

function badgeIcon(templateKey: string) {
  return `/assets/insignias/svg/${templateKey}.svg`;
}

type ChallengeRow = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  status: string;
  templateKey: string;
  progressCount: number;
  targetCount: number;
};

export default async function RetosPage() {
  const user = await requireCurrentUser();

  await ensureWeeklyChallenges(user.teamId);

  const { start } = currentWeekRange();
  const [initialChallenges, weeklyChallenges, monthlyMission, xp] = await Promise.all([
    db.challenge.findMany({
      where: { teamId: user.teamId, group: "INITIAL" },
      orderBy: { createdAt: "asc" },
    }),
    db.challenge.findMany({
      where: { teamId: user.teamId, group: "WEEKLY", periodStart: start },
      orderBy: { createdAt: "asc" },
    }),
    getCurrentMonthlyMission(user.teamId),
    getTeamXp(user.teamId),
  ]);

  const { level, currentThreshold, nextThreshold } = levelForXp(xp);
  const xpIntoLevel = xp - currentThreshold;
  const xpForLevel = (nextThreshold ?? currentThreshold) - currentThreshold || 1;
  const levelPercent = nextThreshold ? (xpIntoLevel / xpForLevel) * 100 : 100;

  const featuredDaily = weeklyChallenges.find((c) => c.status === "ACTIVE") ?? weeklyChallenges[0] ?? null;
  const restWeekly = weeklyChallenges.filter((c) => c.id !== featuredDaily?.id);
  const completedRestWeekly = restWeekly.filter((c) => c.status === "COMPLETED").length;
  const completedInitial = initialChallenges.filter((c) => c.status === "COMPLETED").length;

  return (
    <div className="flex flex-col gap-5 pt-1">
      <div className="relative -mx-4 flex h-24 items-center overflow-hidden">
        <div className="relative z-10 min-w-0 flex-1 pl-4 pr-4">
          <Image src="/assets/titulos/titulo_retos.png" alt="Retos" width={202} height={44} priority />
          <p className="mt-1 text-sm text-ink/60">Cada misión los acerca a su siguiente nivel.</p>
        </div>
        <div
          className="absolute right-0 top-0 flex h-full w-24 shrink-0 items-center justify-center bg-electric"
          style={{ clipPath: HEADER_WEDGE_CLIP }}
        >
          <MaskIcon src="/assets/navegacion/svg/retos.svg" size={30} className="bg-white" />
        </div>
      </div>

      {featuredDaily && (
        <Card className="clip-br-lg relative overflow-hidden !border-0 bg-electric p-4 text-white">
          <DiagonalLines className="right-0 top-0 h-20 w-32" />
          <div className="relative flex items-start justify-between gap-2">
            <RibbonTag>Reto diario</RibbonTag>
            <span className="shrink-0 font-sans text-xs font-bold text-white/70">
              {String(featuredDaily.progressCount).padStart(2, "0")} /{" "}
              {String(featuredDaily.targetCount).padStart(2, "0")}
            </span>
          </div>
          <p className="fq-title relative mt-2 text-2xl uppercase">
            <span>{featuredDaily.title}</span>
          </p>
          <p className="relative mt-1 text-sm text-white/80">{featuredDaily.description}</p>
          <ProgressBar
            percent={(featuredDaily.progressCount / Math.max(1, featuredDaily.targetCount)) * 100}
            className="relative mt-3"
            trackClassName="bg-white/20"
          />
          <div className="relative mt-3 flex items-center justify-between gap-2">
            <span className="shrink-0 rounded-full bg-white px-3 py-1.5 font-sans text-sm font-extrabold text-electric">
              +{featuredDaily.xpReward} XP
            </span>
            {featuredDaily.status === "COMPLETED" ? (
              <span className="text-xs font-bold uppercase text-white/80">Completado</span>
            ) : WEEKLY_AUTO_VERIFIED.has(featuredDaily.templateKey) ? (
              <span className="text-right text-xs font-bold text-white/70">
                Se verifica automático
              </span>
            ) : (
              <CompleteChallengeButton
                action={markWeeklyChallengeDoneAction}
                challengeId={featuredDaily.id}
                label="Comenzar →"
                className="flex items-center gap-1.5 font-sans text-sm font-extrabold text-white disabled:opacity-60"
              />
            )}
          </div>
        </Card>
      )}

      <section className="flex flex-col gap-3">
        <SectionHeading
          action={
            <span className="font-sans text-sm font-bold text-ink/50">
              {completedRestWeekly}/{restWeekly.length}
            </span>
          }
        >
          Misiones en equipo
        </SectionHeading>
        <div className="flex flex-col gap-2.5">
          {restWeekly.map((challenge) => (
            <MissionCard key={challenge.id} challenge={challenge} />
          ))}
        </div>
      </section>

      {initialChallenges.length > 0 && (
        <section className="flex flex-col gap-3">
          <SectionHeading
            action={
              <span className="font-sans text-sm font-bold text-ink/50">
                {completedInitial}/{initialChallenges.length}
              </span>
            }
          >
            Retos iniciales
          </SectionHeading>
          <div className="flex flex-col gap-2.5">
            {initialChallenges.map((challenge) => (
              <MissionCard key={challenge.id} challenge={challenge} allowNotApplicable />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3">
        <SectionHeading>Misión mensual</SectionHeading>
        {monthlyMission ? (
          <Card
            className={`clip-br relative overflow-hidden !border-0 bg-ink p-4 text-white ${monthlyMission.status === "COMPLETED" ? "opacity-70" : ""}`}
          >
            <DiagonalLines className="right-0 top-0 h-16 w-24" opacity={0.15} />
            <RibbonTag className="relative">Misión del mes</RibbonTag>
            <p className="fq-title relative mt-1.5 text-xl uppercase">
              <span>{monthlyMission.title}</span>
            </p>
            <p className="relative text-sm text-white/80">{monthlyMission.description}</p>
            <div className="relative mt-2 flex items-center justify-between">
              <span className="rounded-full bg-white px-3 py-1 font-heading text-sm font-extrabold text-orange">
                +{monthlyMission.xpReward} XP
              </span>
              {monthlyMission.status === "COMPLETED" ? (
                <span className="text-xs font-bold uppercase">Completada</span>
              ) : (
                <MarkMonthlyDoneButton challengeId={monthlyMission.id} />
              )}
            </div>
          </Card>
        ) : (
          <MonthlyMissionForm monthLabel={currentMonthLabel()} />
        )}
      </div>

      <Card className="relative flex items-stretch gap-0 overflow-hidden !p-0">
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center bg-ink text-center font-heading text-[10px] font-extrabold leading-tight text-white"
              style={{ clipPath: NV_HEX_CLIP }}
            >
              NV
              <br />
              {level}
            </span>
            <div className="min-w-0">
              <p className="font-sans text-base font-extrabold text-ink">Ruta de temporada</p>
              <p className="text-xs font-bold text-ink/50">
                {xpIntoLevel} / {xpForLevel} XP · Nivel {level}
              </p>
            </div>
          </div>
          <ProgressBar percent={levelPercent} color="orange" className="mt-3" />
        </div>
        <div
          className="flex w-16 shrink-0 items-center justify-center bg-electric text-white"
          style={{ clipPath: SEASON_ARROW_CLIP }}
        >
          <span className="text-xl font-extrabold" aria-hidden>
            →
          </span>
        </div>
      </Card>
    </div>
  );
}

async function markNotApplicable(formData: FormData) {
  "use server";
  const user = await requireCurrentUser();
  const challengeId = String(formData.get("challengeId") ?? "");
  await markChallengeNotApplicable(user.teamId, challengeId);
}

function MissionCard({
  challenge,
  allowNotApplicable = false,
}: {
  challenge: ChallengeRow;
  allowNotApplicable?: boolean;
}) {
  const completed = challenge.status === "COMPLETED";
  const notApplicable = challenge.status === "NOT_APPLICABLE";
  const isAuto = WEEKLY_AUTO_VERIFIED.has(challenge.templateKey);
  const accent = ORANGE_TEMPLATE_KEYS.has(challenge.templateKey) ? "orange" : "electric";
  const percent = challenge.targetCount > 0 ? (challenge.progressCount / challenge.targetCount) * 100 : 0;
  const canConfirmNotApplicable =
    allowNotApplicable &&
    challenge.status === "ACTIVE" &&
    (challenge.templateKey === "inicial_primer_paso" || challenge.templateKey === "inicial_conoce_al_enemigo");

  return (
    <Card className={cn("flex items-center gap-3", completed && "border-electric bg-electric/5", notApplicable && "opacity-60")}>
      <Image src={badgeIcon(challenge.templateKey)} alt="" width={48} height={48} className="shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-sans text-base font-extrabold text-ink">{challenge.title}</p>
          <span className="shrink-0 rounded-full bg-mist-soft px-2.5 py-1 font-sans text-xs font-extrabold text-orange">
            +{challenge.xpReward} XP
          </span>
        </div>
        <p className="truncate text-xs text-ink/50">{challenge.description}</p>

        {completed ? (
          <p className="mt-1.5 text-xs font-bold uppercase text-electric">Completado</p>
        ) : notApplicable ? (
          <p className="mt-1.5 text-xs font-bold uppercase text-ink/40">No aplica</p>
        ) : (
          <div className="mt-1.5 flex items-center gap-2">
            <ProgressBar percent={percent} className="flex-1" trackClassName="h-1.5" />
            <span className="shrink-0 text-[11px] font-bold text-ink/40">
              {challenge.progressCount}/{challenge.targetCount}
            </span>
            <span className={cn("shrink-0 font-extrabold", accent === "orange" ? "text-orange" : "text-electric")} aria-hidden>
              →
            </span>
          </div>
        )}

        {!completed && !notApplicable && (
          <div className="mt-1.5">
            {canConfirmNotApplicable ? (
              <form action={markNotApplicable}>
                <input type="hidden" name="challengeId" value={challenge.id} />
                <button type="submit" className="text-xs font-bold text-ink/50 underline">
                  No aplica para nosotros
                </button>
              </form>
            ) : isAuto ? (
              <p className="text-xs text-ink/40">Se verifica automáticamente con sus registros.</p>
            ) : (
              <CompleteChallengeButton action={markWeeklyChallengeDoneAction} challengeId={challenge.id} />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
