import { requireCurrentUser } from "@/lib/auth/current-user";
import { NewIncomeForm } from "./NewIncomeForm";

export default async function NuevoIngresoPage() {
  const user = await requireCurrentUser();

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Nueva fuente de ingreso</h1>
        <p className="text-ink/60">Fija, cliente por cobrar o extra: ustedes deciden.</p>
      </div>
      <NewIncomeForm members={user.team.members.map((m) => ({ id: m.id, name: m.name }))} />
    </div>
  );
}
