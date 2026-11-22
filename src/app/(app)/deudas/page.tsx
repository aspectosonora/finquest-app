import Image from "next/image";
import { Suspense } from "react";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getDebtsSummaryCached as getDebtsSummary } from "@/lib/finance/dashboard-cached";
import { createOtherDebtAction } from "@/lib/finance/debt-actions";
import { debtCategoryMeta } from "@/lib/constants/debts";
import { formatCents } from "@/lib/finance/money";
import { KoBar } from "@/components/ui/KoBar";
import { ButtonLink } from "@/components/ui/Button";
import { RibbonTag } from "@/components/ui/RibbonTag";
import { DiagonalLines } from "@/components/ui/DiagonalLines";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { CelebrationFromQuery } from "@/components/effects/CelebrationFromQuery";
import { DebtStrategyToggle } from "./DebtStrategyToggle";

const CARD_CLIP = "polygon(0 0, 100% 0, 100% 86%, 92% 100%, 0 100%)";
const ILLUSTRATION_WEDGE_CLIP = "polygon(38% 0, 100% 0, 100% 100%, 0% 100%)";

export default async function DeudasPage() {
  const user = await requireCurrentUser();
  const debts = await getDebtsSummary(user.teamId);

  const activeCount = debts.filter((d) => d.status === "ACTIVE").length;
  const defeatedCount = debts.filter((d) => d.status === "DEFEATED").length;

  return (
    <div className="flex flex-col pt-1">
      <Suspense fallback={null}>
        <CelebrationFromQuery />
      </Suspense>
      <div className="-mx-4 bg-electric px-[14px] pb-7 pt-4 text-white">
        <DiagonalLines className="right-0 top-0 h-24 w-36" />
        <div className="relative flex items-center justify-between gap-3">
          <Image src="/assets/titulos/titulo_deudas.png" alt="Deudas" width={198} height={32} priority />
          <div className="relative h-[66px] w-[132px] shrink-0">
            <Image src="/assets/deudas/07_ko.png" alt="KO" fill sizes="132px" className="object-contain" />
          </div>
        </div>
        <p className="relative mt-1.5 font-sans text-sm font-bold text-white/90">Cada pago es un golpe al boss.</p>

        <div className="relative mt-4 flex items-center gap-3 border-t border-white/20 pt-3">
          <span className="flex items-center gap-1.5">
            <MaskIcon src="/assets/navegacion/svg/deudas.svg" size={18} className="bg-white" />
            <span className="font-heading text-xl font-black italic">{activeCount}</span>
            <span className="font-sans text-xs font-bold uppercase tracking-wide">bosses activos</span>
          </span>
          <span className="h-5 w-px shrink-0 bg-white/25" />
          <span className="flex items-center gap-1.5">
            <MaskIcon src="/assets/navegacion/svg/metas.svg" size={18} className="bg-white" />
            <span className="font-heading text-xl font-black italic">{defeatedCount}</span>
            <span className="font-sans text-xs font-bold uppercase tracking-wide">derrotados</span>
          </span>
        </div>

        {activeCount > 1 && <DebtStrategyToggle current={user.team.debtStrategy} />}
      </div>

      <div className="-mx-4 flex flex-col gap-[10px] bg-electric px-[6px] pb-7 pt-[10px]">
        {debts.map((debt, index) => {
          const meta = debtCategoryMeta(debt.category);
          const isUnconfigured = debt.status === "UNCONFIGURED";
          const isDefeated = debt.status === "DEFEATED";

          return (
            <div
              key={debt.id}
              className="relative flex h-[158px] flex-col overflow-hidden bg-white"
              style={{ clipPath: CARD_CLIP }}
            >
              <div className="relative flex min-w-0 flex-1">
                <div className="relative z-10 flex min-w-0 flex-[1.3] flex-col justify-center gap-1.5 py-2 pl-3 pr-1">
                  <div className="min-w-0">
                    <RibbonTag>Boss {String(index + 1).padStart(2, "0")}</RibbonTag>
                    <h2 className="mt-1.5 truncate font-heading text-[22px] font-black italic uppercase leading-none text-ink">
                      {debt.name}
                    </h2>
                    <p className="mt-1 truncate font-sans text-xs font-bold text-ink/50">
                      {isUnconfigured
                        ? "Sin configurar"
                        : isDefeated
                          ? "¡Boss derrotado!"
                          : `${formatCents(debt.balanceCents)} restantes`}
                    </p>
                  </div>
                  <KoBar percent={debt.progressPercent} status={debt.status} />
                </div>
                {meta && (
                  <div className="relative min-w-0 flex-1 overflow-hidden">
                    <div
                      className="absolute inset-0 bg-electric"
                      style={{ clipPath: ILLUSTRATION_WEDGE_CLIP }}
                    />
                    <Image
                      src={meta.illustration}
                      alt=""
                      fill
                      sizes="170px"
                      className="relative object-contain object-right p-2"
                    />
                  </div>
                )}
              </div>
              <div className="px-2 pb-2">
                <ButtonLink
                  href={`/deudas/${debt.id}/configurar`}
                  variant="primary"
                  className="w-full !py-2.5 !text-sm"
                >
                  {isUnconfigured ? "Configurar" : "Editar"} →
                </ButtonLink>
              </div>
            </div>
          );
        })}
      </div>

      <form action={createOtherDebtAction} className="mt-4">
        <button
          type="submit"
          className="w-full text-center font-heading font-bold text-electric underline"
        >
          + Agregar otra deuda
        </button>
      </form>
    </div>
  );
}
