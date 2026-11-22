import "server-only";
import { db } from "@/lib/db";

export async function getEmergencyFundGoal(teamId: string) {
  return db.goal.findFirst({ where: { teamId, category: "EMERGENCY_FUND" } });
}

/**
 * Monto sugerido para el fondo de emergencia: punto medio (4 meses) de la
 * regla de 3-6 meses de gasto, estimado con lo que ya tengan configurado
 * (presupuestos y compromisos recurrentes). Si todavía no configuran nada,
 * regresa 0 y el monto se deja en blanco para que lo capturen ellos.
 */
export async function suggestEmergencyFundTargetCents(teamId: string): Promise<number> {
  const [budgets, commitments] = await Promise.all([
    db.budgetCategory.findMany({ where: { teamId } }),
    db.commitment.findMany({ where: { teamId } }),
  ]);

  const monthlyBudgetCents = budgets.reduce((sum, b) => sum + b.monthlyLimitCents, 0);
  const monthlyCommitmentCents = commitments.reduce((sum, c) => sum + c.amountCents, 0);
  const monthlyEstimateCents = Math.max(monthlyBudgetCents, monthlyCommitmentCents);

  return monthlyEstimateCents * 4;
}
