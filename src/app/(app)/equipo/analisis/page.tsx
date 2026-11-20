import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import {
  getAvailableTodayCached as getAvailableToday,
  getTeamSavingsCached as getTeamSavings,
  getDebtsSummaryCached as getDebtsSummary,
  getReceivableTotalCached as getReceivableTotal,
  getPrimaryGoalCached as getPrimaryGoal,
} from "@/lib/finance/dashboard-cached";
import { formatCents } from "@/lib/finance/money";
import { Card } from "@/components/ui/Card";

export default async function AnalisisPage() {
  const user = await requireCurrentUser();
  const [available, savings, debts, receivable, primaryGoal] = await Promise.all([
    getAvailableToday(user.teamId),
    getTeamSavings(user.teamId),
    getDebtsSummary(user.teamId),
    getReceivableTotal(user.teamId),
    getPrimaryGoal(user.teamId),
  ]);

  const activeDebts = debts.filter((d) => d.status === "ACTIVE");
  const totalDebtBalance = activeDebts.reduce((sum, d) => sum + d.balanceCents, 0);
  const insights = buildInsights({ available, savings, activeDebts, totalDebtBalance, receivable, primaryGoal });

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">FinQuest IA</h1>
        <p className="text-ink/60">
          Análisis determinista basado solo en sus datos reales. Sin modelo de lenguaje externo todavía: no se
          inventa ni proyecta nada que no esté registrado.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {insights.map((insight, i) => (
          <Card key={i}>{insight}</Card>
        ))}
      </div>

      <Link href="/equipo" className="text-center font-heading font-bold text-electric underline">
        ← Volver a Equipo
      </Link>
    </div>
  );
}

function buildInsights({
  available,
  savings,
  activeDebts,
  totalDebtBalance,
  receivable,
  primaryGoal,
}: {
  available: number;
  savings: number;
  activeDebts: { name: string; balanceCents: number }[];
  totalDebtBalance: number;
  receivable: number;
  primaryGoal: { name: string; accumulatedCents: number; targetAmountCents: number } | null;
}) {
  const lines: string[] = [];

  lines.push(
    available > 0
      ? `Hoy tienen ${formatCents(available)} disponibles realmente, después de pagos, reservas y sueldos liberados.`
      : "Todavía no tienen dinero disponible registrado. Registren sus primeros cobros para empezar a ver su disponible real."
  );

  if (receivable > 0) {
    lines.push(`Tienen ${formatCents(receivable)} por cobrar que aún no cuentan como disponible.`);
  }

  if (activeDebts.length > 0) {
    const biggest = [...activeDebts].sort((a, b) => b.balanceCents - a.balanceCents)[0];
    lines.push(
      `Su boss más grande ahora es "${biggest.name}" con ${formatCents(biggest.balanceCents)} pendientes, de un total de ${formatCents(totalDebtBalance)} en ${activeDebts.length} deuda${activeDebts.length === 1 ? "" : "s"} activa${activeDebts.length === 1 ? "" : "s"}.`
    );
  } else {
    lines.push("No tienen deudas activas configuradas todavía.");
  }

  if (primaryGoal) {
    const pct = Math.round((primaryGoal.accumulatedCents / primaryGoal.targetAmountCents) * 100);
    lines.push(`Su misión principal "${primaryGoal.name}" va al ${pct}% de avance.`);
  } else {
    lines.push("Aún no definen una misión principal de ahorro.");
  }

  lines.push(
    savings > 0
      ? `Llevan ${formatCents(savings)} ahorrados en conjunto hacia sus metas.`
      : "Todavía no registran aportaciones de ahorro a sus metas."
  );

  return lines;
}
