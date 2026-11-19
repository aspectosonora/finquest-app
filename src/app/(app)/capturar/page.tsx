import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import { CaptureForm } from "./CaptureForm";

const TITLES: Record<string, string> = {
  INGRESO_COBRADO: "Registrar ingreso cobrado",
  GASTO: "Registrar gasto",
  PAGO: "Registrar pago",
  ABONO_DEUDA: "Registrar abono a deuda",
  APARTAR: "Apartar dinero",
  LIBERAR_SUELDO: "Liberar sueldo personal",
};

export default async function CapturarPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const { tipo } = await searchParams;
  const user = await requireCurrentUser();

  if (!tipo || !TITLES[tipo]) {
    return (
      <div className="pt-2">
        <EmptyState title="Elige qué quieren registrar" description="Usa el botón + para abrir las opciones." />
      </div>
    );
  }

  const members = user.team.members.map((m) => ({ id: m.id, name: m.name }));

  if (tipo === "ABONO_DEUDA") {
    const activeDebts = await db.debt.findMany({
      where: { teamId: user.teamId, status: "ACTIVE" },
      orderBy: { sortOrder: "asc" },
    });
    if (activeDebts.length === 0) {
      return (
        <div className="flex flex-col gap-4 pt-2">
          <EmptyState
            title="Todavía no tienen deudas configuradas"
            description="Configuren al menos una deuda antes de registrar un abono."
            action={
              <ButtonLink href="/deudas" className="mt-2">
                Ir a Deudas →
              </ButtonLink>
            }
          />
        </div>
      );
    }
    return (
      <Shell title={TITLES[tipo]}>
        <CaptureForm tipo={tipo} members={members} debts={activeDebts.map((d) => ({ id: d.id, name: d.name }))} />
      </Shell>
    );
  }

  if (tipo === "GASTO" || tipo === "PAGO") {
    const budgets = await db.budgetCategory.findMany({
      where: { teamId: user.teamId },
      orderBy: { createdAt: "asc" },
    });
    return (
      <Shell title={TITLES[tipo]}>
        <CaptureForm tipo={tipo} members={members} budgets={budgets.map((b) => ({ id: b.id, name: b.name }))} />
      </Shell>
    );
  }

  return (
    <Shell title={TITLES[tipo]}>
      <CaptureForm tipo={tipo} members={members} />
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5 pt-2">
      <h1 className="font-display text-3xl text-ink">{title}</h1>
      {children}
    </div>
  );
}
