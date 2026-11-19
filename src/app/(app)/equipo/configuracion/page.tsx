import Link from "next/link";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { getTeamDefaultSplit } from "@/lib/finance/split-query";
import { logoutAction } from "@/lib/auth/actions";
import { Card } from "@/components/ui/Card";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { InviteCodeCard } from "@/components/team/InviteCodeCard";
import { TeamNameForm } from "./TeamNameForm";
import { AvatarPicker } from "./AvatarPicker";
import { SplitSettingsForm } from "./SplitSettingsForm";
import { PinSettingsForm } from "./PinSettingsForm";

export default async function ConfiguracionPage() {
  const user = await requireCurrentUser();
  const members = user.team.members;
  const split = await getTeamDefaultSplit(user.teamId);
  const julioPercent = split?.shares.find((s) => s.userId === members[0]?.id)?.percent ?? 50;

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div>
        <h1 className="font-display text-3xl text-ink">Configuración</h1>
        <p className="text-ink/60">{user.team.name}</p>
      </div>

      <section className="flex flex-col gap-2">
        <SectionHeading>Nombre del equipo</SectionHeading>
        <Card>
          <TeamNameForm name={user.team.name} />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeading>Avatares</SectionHeading>
        <Card className="flex flex-col gap-4">
          {members.map((m) => (
            <AvatarPicker key={m.id} userId={m.id} name={m.name} currentAvatarKey={m.avatarKey} />
          ))}
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeading>Reparto por defecto</SectionHeading>
        <Card>
          {members.length < 2 ? (
            <p className="text-sm text-ink/60">
              Falta que tu pareja se una al equipo para poder ajustar el reparto.
            </p>
          ) : (
            <SplitSettingsForm
              members={members.map((m) => ({ id: m.id, name: m.name }))}
              currentJulioPercent={julioPercent}
            />
          )}
        </Card>
      </section>

      {members.length < 2 && (
        <section className="flex flex-col gap-2">
          <SectionHeading>Invitar a tu pareja</SectionHeading>
          <InviteCodeCard inviteCode={user.team.inviteCode} returnTo="/equipo/configuracion" />
        </section>
      )}

      <section className="flex flex-col gap-2">
        <SectionHeading>Código de acceso</SectionHeading>
        <Card>
          <PinSettingsForm hasPinSet={Boolean(user.pinCode)} />
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeading>Cuenta</SectionHeading>
        <Card className="flex items-center justify-between">
          <span className="text-sm text-ink/60">{user.email}</span>
          <form action={logoutAction}>
            <button type="submit" className="font-heading font-bold text-orange-dark underline">
              Cerrar sesión
            </button>
          </form>
        </Card>
      </section>

      <Link href="/equipo" className="text-center font-heading font-bold text-electric underline">
        ← Volver a Equipo
      </Link>
    </div>
  );
}
