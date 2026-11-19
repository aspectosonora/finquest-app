import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import { SalaryForm } from "./SalaryForm";

export default async function SueldosPage() {
  const user = await requireCurrentUser();
  const configs = await db.personalSalaryConfig.findMany({ where: { teamId: user.teamId } });
  const byUser = Object.fromEntries(configs.map((c) => [c.userId, c.desiredAmountCents]));

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Sueldo personal</h1>
        <p className="text-ink/60">
          Definan cuánto quiere tener cada quien al mes para uso libre, sin explicaciones ni tickets.
        </p>
      </div>
      <SalaryForm
        members={user.team.members.map((m) => ({
          id: m.id,
          name: m.name,
          desiredAmountCents: byUser[m.id] ?? 0,
        }))}
      />
    </div>
  );
}
