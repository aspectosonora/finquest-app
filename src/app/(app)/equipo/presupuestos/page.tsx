import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listBudgetsWithUsage } from "@/lib/finance/budget-query";
import { deleteBudgetCategoryAction } from "@/lib/finance/budget-actions";
import { formatCents } from "@/lib/finance/money";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewBudgetForm } from "./NewBudgetForm";

export default async function PresupuestosPage() {
  const user = await requireCurrentUser();
  const budgets = await listBudgetsWithUsage(user.teamId);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Presupuestos</h1>
        <p className="text-ink/60">Cuánto planean gastar este mes por categoría.</p>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          title="Sin categorías todavía"
          description="Creen su primera categoría de presupuesto para empezar a controlar sus gastos."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-extrabold">{budget.name}</span>
                <span
                  className={`font-heading text-sm font-extrabold ${budget.percent >= 100 ? "text-orange" : "text-ink/60"}`}
                >
                  {budget.percent}%
                </span>
              </div>
              <ProgressBar
                percent={budget.percent}
                color={budget.percent >= 100 ? "orange" : "electric"}
                className="mt-2"
              />
              <div className="mt-2 flex items-center justify-between text-sm text-ink/60">
                <span>
                  {formatCents(budget.usedCents)} de {formatCents(budget.monthlyLimitCents)}
                </span>
                <form action={deleteBudgetCategoryAction}>
                  <input type="hidden" name="id" value={budget.id} />
                  <button type="submit" className="text-xs font-bold text-ink/40 underline">
                    Eliminar
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewBudgetForm />

      <Link href="/equipo" className="text-center font-heading font-bold text-electric underline">
        ← Volver a Equipo
      </Link>
    </div>
  );
}
