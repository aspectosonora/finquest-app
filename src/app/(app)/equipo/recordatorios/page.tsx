import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function RecordatoriosPage() {
  await requireCurrentUser();

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Recordatorios</h1>
        <p className="text-ink/60">Avisos de pagos, cobros y metas.</p>
      </div>

      <EmptyState
        title="Todavía no hay recordatorios"
        description="La suscripción al calendario de iPhone y los avisos automáticos llegan en una próxima fase."
      />

      <Link href="/equipo" className="text-center font-heading font-bold text-electric underline">
        ← Volver a Equipo
      </Link>
    </div>
  );
}
