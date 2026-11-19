import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { listRecentMovements, MOVEMENT_TYPE_LABELS } from "@/lib/finance/movements-query";
import { formatCents } from "@/lib/finance/money";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function MovimientosPage() {
  const user = await requireCurrentUser();
  const movements = await listRecentMovements(user.teamId);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Movimientos</h1>
        <p className="text-ink/60">Historial real de su equipo, los más recientes primero.</p>
      </div>

      {movements.length === 0 ? (
        <EmptyState title="Sin movimientos todavía" description="Aquí verán cada registro que hagan con el botón +." />
      ) : (
        <div className="flex flex-col gap-2">
          {movements.map((m) => {
            const positive = m.amountCents >= 0;
            return (
              <Card key={m.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="font-heading font-bold">{MOVEMENT_TYPE_LABELS[m.type] ?? m.type}</p>
                  <p className="truncate text-xs text-ink/50">
                    {m.user?.name ?? "Equipo"}
                    {m.budgetCategoryName ? ` · ${m.budgetCategoryName}` : m.category ? ` · ${m.category}` : ""}
                    {m.note ? ` · ${m.note}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`font-heading font-extrabold ${positive ? "text-electric" : "text-ink"}`}>
                    {positive ? "+" : ""}
                    {formatCents(m.amountCents)}
                  </p>
                  <p className="text-xs text-ink/40">
                    {new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short" }).format(m.occurredAt)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Link href="/equipo" className="text-center font-heading font-bold text-electric underline">
        ← Volver a Equipo
      </Link>
    </div>
  );
}
