import "server-only";

import { unstable_cache } from "next/cache";
import {
  getAvailableToday,
  getTeamXp,
  getPersonalFreeMoney,
  getTeamSavings,
  getPrimaryGoal,
  getActiveBoss,
  getDebtsSummary,
  getUpcomingChallenges,
  getReceivableTotal,
  getReceivedTotal,
  getReservedTotal,
  getIncomeTotalsByType,
} from "@/lib/finance/dashboard";
import { getTeamDefaultSplit } from "@/lib/finance/split-query";
import { FINANCE_CACHE_TAG } from "@/lib/finance/cache-tags";

/**
 * Versiones cacheadas (5s) de las lecturas de dashboard.ts, SOLO para
 * mostrar en pantalla. unstable_cache usa el Data Cache de Vercel, que es
 * compartido entre instancias (no un Map en memoria por proceso), así que
 * revalidateTag(FINANCE_CACHE_TAG) invalida para todas las instancias a la
 * vez, no solo la que atendió la mutación.
 *
 * IMPORTANTE: nunca usar estas versiones para validar una operación
 * financiera (p. ej. "¿alcanza el disponible para liberar este sueldo?").
 * Esa validación debe seguir llamando a la función original, sin cachear,
 * de @/lib/finance/dashboard. Ver movements.ts.
 *
 * Invalidación: las acciones que mutan datos llaman a updateTag(FINANCE_CACHE_TAG)
 * (no revalidateTag, que por defecto sirve contenido viejo mientras revalida en
 * segundo plano). updateTag expira la caché de inmediato y solo funciona dentro
 * de Server Actions, que es exactamente donde viven todas esas mutaciones.
 */
const REVALIDATE_SECONDS = 5;

function cached<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
  keyPrefix: string
) {
  return unstable_cache(fn, [keyPrefix], {
    tags: [FINANCE_CACHE_TAG],
    revalidate: REVALIDATE_SECONDS,
  });
}

export const getAvailableTodayCached = cached(getAvailableToday, "dash-available");
export const getTeamXpCached = cached(getTeamXp, "dash-xp");
export const getPersonalFreeMoneyCached = cached(getPersonalFreeMoney, "dash-free-money");
export const getTeamSavingsCached = cached(getTeamSavings, "dash-savings");
export const getPrimaryGoalCached = cached(getPrimaryGoal, "dash-primary-goal");
export const getActiveBossCached = cached(getActiveBoss, "dash-active-boss");
export const getDebtsSummaryCached = cached(getDebtsSummary, "dash-debts-summary");
export const getUpcomingChallengesCached = cached(getUpcomingChallenges, "dash-upcoming-challenges");
export const getReceivableTotalCached = cached(getReceivableTotal, "dash-receivable");
export const getReceivedTotalCached = cached(getReceivedTotal, "dash-received");
export const getReservedTotalCached = cached(getReservedTotal, "dash-reserved");
export const getIncomeTotalsByTypeCached = cached(getIncomeTotalsByType, "dash-income-totals");
export const getTeamDefaultSplitCached = cached(getTeamDefaultSplit, "dash-default-split");
