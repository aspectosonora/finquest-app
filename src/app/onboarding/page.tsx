import Image from "next/image";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { logoutAction } from "@/lib/auth/actions";
import { getTeamDefaultSplit } from "@/lib/finance/split-query";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { InviteCodeCard } from "@/components/team/InviteCodeCard";
import { SplitForm } from "./SplitForm";
import { FinishStep } from "./FinishStep";

export default async function OnboardingPage() {
  const user = await requireCurrentUser();
  const members = user.team.members;
  const defaultSplit = await getTeamDefaultSplit(user.teamId);

  const step = members.length < 2 ? 1 : !defaultSplit ? 2 : 3;

  return (
    <div className="mx-auto flex min-h-full max-w-md flex-col gap-6 px-5 py-8">
      <div className="flex flex-col items-center gap-1 text-center">
        <Image
          src="/assets/identidad/logo_finquest.png"
          alt="FinQuest"
          width={200}
          height={50}
          className="h-9 w-auto"
        />
        <h1 className="font-display text-2xl text-ink">Configuremos nuestra aventura</h1>
        <p className="text-sm text-ink/60">Paso {step} de 3 (configuración esencial)</p>
      </div>

      <StepProgress step={step} />

      {step === 1 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-extrabold uppercase">1. Confirmen integrantes</h2>
          <div className="grid grid-cols-2 gap-3">
            {members.map((m) => (
              <Card key={m.id} className="flex flex-col items-center gap-1 text-center">
                <Avatar avatarKey={m.avatarKey} avatarUrl={m.avatarUrl} name={m.name} size={56} />
                <span className="font-heading font-bold">{m.name}</span>
              </Card>
            ))}
            <Card className="flex flex-col items-center justify-center gap-1 border-dashed text-center text-ink/40">
              Esperando a tu pareja
            </Card>
          </div>
          <InviteCodeCard inviteCode={user.team.inviteCode} />
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-xl font-extrabold uppercase">2. Porcentaje de aportación</h2>
          <p className="text-sm text-ink/60">
            Este reparto aplica a los compromisos compartidos, no a todo su ingreso personal. Pueden ajustarlo
            cuando quieran desde Equipo.
          </p>
          <SplitForm members={members.map((m) => ({ id: m.id, name: m.name }))} />
        </section>
      )}

      {step === 3 && <FinishStep members={members} />}

      <form action={logoutAction} className="text-center">
        <button type="submit" className="font-heading text-xs font-bold text-ink/30 underline">
          ¿Entraste con la cuenta equivocada? Cerrar sesión
        </button>
      </form>
    </div>
  );
}

function StepProgress({ step }: { step: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={`h-1.5 flex-1 rounded-full ${n <= step ? "bg-electric" : "bg-mist"}`}
        />
      ))}
    </div>
  );
}
