import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  monthlyIncomeVsExpense,
  currentMonthExpensesByCategory,
  savingsEvolution,
  debtReductionSummary,
  pledgedVsActualThisMonth,
} from "@/lib/finance/charts-query";
import { getReceivableTotal, getTeamSavings } from "@/lib/finance/dashboard";
import { formatCents } from "@/lib/finance/money";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { HorizontalBarList } from "@/components/charts/HorizontalBarList";

export default async function GraficasPage() {
  const user = await requireCurrentUser();
  const teamId = user.teamId;

  const [incomeVsExpense, expensesByCategory, savings, debts, pledgedVsActual, receivable, totalSaved] =
    await Promise.all([
      monthlyIncomeVsExpense(teamId),
      currentMonthExpensesByCategory(teamId),
      savingsEvolution(teamId),
      debtReductionSummary(teamId),
      pledgedVsActualThisMonth(teamId),
      getReceivableTotal(teamId),
      getTeamSavings(teamId),
    ]);

  const hasAnyMovement = incomeVsExpense.some((m) => m.a > 0 || m.b > 0);
  const hasSavings = savings.some((s) => s.cents > 0);

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Gráficas</h1>
        <p className="text-ink/60">Su progreso, con datos reales — vacío si todavía no registran nada.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Por cobrar" value={formatCents(receivable)} />
        <StatTile label="Ahorro acumulado" value={formatCents(totalSaved)} />
      </div>

      <ChartCard title="Ingresos vs. gastos" subtitle="Últimos 6 meses">
        {hasAnyMovement ? (
          <GroupedBarChart groups={incomeVsExpense} seriesALabel="Ingresos" seriesBLabel="Gastos" />
        ) : (
          <EmptyState title="Sin movimientos todavía" description="Registren un ingreso o gasto para ver esta gráfica." />
        )}
      </ChartCard>

      <ChartCard title="Gastos por categoría" subtitle="Este mes">
        {expensesByCategory.length > 0 ? (
          <HorizontalBarList items={expensesByCategory} color="orange" />
        ) : (
          <EmptyState title="Sin gastos este mes" description="Registren un gasto para ver el desglose por categoría." />
        )}
      </ChartCard>

      <ChartCard title="Evolución del ahorro" subtitle="Aportaciones por mes, últimos 6 meses">
        {hasSavings ? (
          <HorizontalBarList items={savings.filter((s) => s.cents > 0).map((s) => ({ label: s.label, cents: s.cents }))} />
        ) : (
          <EmptyState title="Sin aportaciones todavía" description="Registren una aportación a una meta." />
        )}
      </ChartCard>

      <ChartCard title="Reducción de deudas" subtitle={`Reducido en total: ${formatCents(debts.totalReduced)}`}>
        {debts.items.length > 0 ? (
          <HorizontalBarList items={debts.items} color="orange" />
        ) : (
          <EmptyState title="Sin deudas configuradas" description="Configuren una deuda en la pestaña Deudas." />
        )}
      </ChartCard>

      <ChartCard
        title="Aportaciones pactadas vs. reales"
        subtitle="Abonos a deudas este mes, según su % de reparto sobre el pago mensual configurado"
      >
        {pledgedVsActual.some((p) => p.a > 0 || p.b > 0) ? (
          <GroupedBarChart groups={pledgedVsActual} seriesALabel="Pactado" seriesBLabel="Real" />
        ) : (
          <EmptyState
            title="Sin datos todavía"
            description="Configuren el pago mensual de una deuda y registren un abono para comparar."
          />
        )}
      </ChartCard>

      <Link href="/equipo" className="text-center font-heading font-bold text-electric underline">
        ← Volver a Equipo
      </Link>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-xs font-bold uppercase text-ink/50">{label}</p>
      <p className="font-display text-2xl text-ink">{value}</p>
    </Card>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card>
      <p className="font-heading text-lg font-extrabold uppercase">{title}</p>
      {subtitle && <p className="mb-3 text-xs text-ink/50">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-3"}>{children}</div>
    </Card>
  );
}
