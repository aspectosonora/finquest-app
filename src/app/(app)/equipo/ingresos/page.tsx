import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { formatCents } from "@/lib/finance/money";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CollectForm } from "./CollectForm";

const TYPE_LABELS: Record<string, string> = {
  FIXED: "Ingresos fijos",
  RECEIVABLE_CLIENT: "Clientes por cobrar",
  EXTRA: "Extras",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  OVERDUE: "Vencido",
  PARTIAL: "Pago parcial",
  PAID: "Cobrado",
  CANCELLED: "Cancelado",
};

export default async function IngresosPage() {
  const user = await requireCurrentUser();
  const sources = await db.incomeSource.findMany({
    where: { teamId: user.teamId },
    include: { payments: { orderBy: { createdAt: "desc" } }, owner: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Ingresos y cobros</h1>
        <p className="text-ink/60">Solo lo cobrado cuenta como disponible.</p>
      </div>

      <ButtonLink href="/equipo/ingresos/nuevo">+ Nueva fuente de ingreso →</ButtonLink>

      {sources.length === 0 ? (
        <EmptyState title="Sin fuentes registradas" description="Agreguen sus ingresos fijos, clientes o extras." />
      ) : (
        ["FIXED", "RECEIVABLE_CLIENT", "EXTRA"].map((type) => {
          const group = sources.filter((s) => s.type === type);
          if (group.length === 0) return null;
          return (
            <section key={type} className="flex flex-col gap-2">
              <h2 className="font-heading text-lg font-extrabold uppercase">{TYPE_LABELS[type]}</h2>
              {group.map((source) => (
                <Card key={source.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-heading font-bold">{source.name}</p>
                      <p className="text-xs text-ink/50">
                        {source.owner.name} · {source.isVariable ? "Variable" : formatCents(source.amountCents ?? 0)}
                      </p>
                    </div>
                    {source.status !== "ACTIVE" && (
                      <span className="text-xs font-bold uppercase text-ink/40">{source.status}</span>
                    )}
                  </div>

                  {source.payments.length > 0 && (
                    <ul className="mt-2 flex flex-col gap-1">
                      {source.payments.map((payment) => (
                        <li key={payment.id} className="flex items-center justify-between text-sm">
                          <span className="text-ink/60">
                            {STATUS_LABELS[payment.status]} · {formatCents(payment.amountCents)}
                          </span>
                          {payment.status !== "PAID" && payment.status !== "CANCELLED" ? (
                            <CollectForm paymentId={payment.id} pendingAmountCents={payment.amountCents - payment.receivedAmountCents} />
                          ) : (
                            <span className="font-bold text-electric">✓</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              ))}
            </section>
          );
        })
      )}

      <Link href="/equipo" className="text-center font-heading font-bold text-electric underline">
        ← Volver a Equipo
      </Link>
    </div>
  );
}
