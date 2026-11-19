import { splitAmount, type SplitShareInput } from "@/lib/finance/split";

export type GoalMode = "BY_DATE" | "BY_BUDGET";

export type GoalCalcInput = {
  targetAmountCents: number;
  accumulatedCents: number;
  mode: GoalMode;
  /** Modo por fecha: mensualidades restantes elegidas por la pareja. */
  remainingInstallments?: number | null;
  /** Modo por presupuesto: cuánto pueden ahorrar al mes. */
  monthlyBudgetCents?: number | null;
  shares: SplitShareInput[];
};

export type GoalCalcResult = {
  remainingCents: number;
  progressPercent: number;
  monthlyRequiredCents: number;
  remainingInstallments: number;
  perMember: { userId: string; percent: number; amountCents: number }[];
  isOverdue: boolean;
};

/**
 * Replica el caso de prueba de referencia: meta $18,000, acumulado $6,000,
 * 4 mensualidades restantes -> mensual $3,000, Julio $1,950, Cinthya $1,050.
 */
export function calculateGoal(input: GoalCalcInput): GoalCalcResult {
  const remainingCents = Math.max(0, input.targetAmountCents - input.accumulatedCents);
  const progressPercent =
    input.targetAmountCents > 0
      ? Math.min(100, (input.accumulatedCents / input.targetAmountCents) * 100)
      : 0;

  let monthlyRequiredCents = 0;
  let remainingInstallments = 0;
  let isOverdue = false;

  if (input.mode === "BY_DATE") {
    remainingInstallments = Math.max(0, input.remainingInstallments ?? 0);
    if (remainingCents === 0) {
      monthlyRequiredCents = 0;
    } else if (remainingInstallments <= 0) {
      isOverdue = true;
      monthlyRequiredCents = remainingCents;
    } else {
      monthlyRequiredCents = Math.ceil(remainingCents / remainingInstallments);
    }
  } else {
    const monthlyBudget = input.monthlyBudgetCents ?? 0;
    monthlyRequiredCents = monthlyBudget;
    remainingInstallments = monthlyBudget > 0 ? Math.ceil(remainingCents / monthlyBudget) : 0;
  }

  const perMember =
    input.shares.length > 0 && monthlyRequiredCents > 0
      ? splitAmount(monthlyRequiredCents, input.shares)
      : input.shares.map((s) => ({ userId: s.userId, percent: s.percent, amountCents: 0 }));

  return {
    remainingCents,
    progressPercent,
    monthlyRequiredCents,
    remainingInstallments,
    perMember,
    isOverdue,
  };
}
