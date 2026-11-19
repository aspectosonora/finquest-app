import { notFound } from "next/navigation";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { DebtConfigureForm } from "./DebtConfigureForm";

export default async function ConfigurarDeudaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireCurrentUser();

  const debt = await db.debt.findFirst({ where: { id, teamId: user.teamId } });
  if (!debt) notFound();

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Configurar deuda</h1>
        <p className="text-ink/60">Registra solo lo que sepan hoy; pueden editarlo después.</p>
      </div>
      <DebtConfigureForm debt={debt} members={user.team.members} />
    </div>
  );
}
