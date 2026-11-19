import Link from "next/link";
import Image from "next/image";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { db } from "@/lib/db";
import {
  getAvailableToday,
  getReceivedTotal,
  getReceivableTotal,
  getReservedTotal,
  getIncomeTotalsByType,
} from "@/lib/finance/dashboard";
import { getTeamDefaultSplit } from "@/lib/finance/split-query";
import { formatCents } from "@/lib/finance/money";
import { weekdayShort } from "@/lib/date/month";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { DiagonalLines } from "@/components/ui/DiagonalLines";
import { CornerAccent } from "@/components/ui/CornerAccent";
import { timed } from "@/lib/perf/timing";

export default async function EquipoPage() {
  const pageStart = Date.now();
  const user = await requireCurrentUser();
  const teamId = user.teamId;

  const [available, received, receivable, reserved, incomeTotals, defaultSplit, salaryConfigs] =
    await timed("equipo.dataPromiseAll", () =>
      Promise.all([
        getAvailableToday(teamId),
        getReceivedTotal(teamId),
        getReceivableTotal(teamId),
        getReservedTotal(teamId),
        getIncomeTotalsByType(teamId),
        getTeamDefaultSplit(teamId),
        db.personalSalaryConfig.findMany({ where: { teamId } }),
      ])
    );
  console.log(`[perf] equipo.beforeRender ${Date.now() - pageStart}ms`);

  const members = user.team.members;
  const shareByUser = Object.fromEntries((defaultSplit?.shares ?? []).map((s) => [s.userId, s.percent]));
  const salaryByUser = Object.fromEntries(salaryConfigs.map((c) => [c.userId, c.desiredAmountCents]));
  const [memberA, memberB] = members;

  const today = new Date();
  const weekDays = buildWeek(today);

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <Image src="/assets/titulos/titulo_equipo.png" alt="Equipo" width={208} height={44} priority />
          <p className="mt-1 text-ink/60">El control de nuestras finanzas.</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href="/equipo/recordatorios"
            aria-label="Recordatorios"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink"
          >
            <Image src="/assets/interfaz/svg/recordatorios.svg" alt="" width={20} height={20} />
          </Link>
          <Link
            href="/equipo/configuracion"
            aria-label="Configuración"
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-ink"
          >
            <Image src="/assets/interfaz/svg/configuracion.svg" alt="" width={20} height={20} />
          </Link>
        </div>
      </div>

      {!user.team.onboardingCompletedAt && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="font-heading font-extrabold uppercase">Configuren su mes</p>
            <p className="text-sm text-ink/60">Comiencen juntos</p>
          </div>
          <ButtonLink href="/onboarding" className="w-auto">
            Configurar →
          </ButtonLink>
        </Card>
      )}

      <section className="flex flex-col gap-2">
        <SectionHeading>Próximos pagos</SectionHeading>
        <Card>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="font-heading font-bold">0 pendientes</p>
              <p className="text-sm text-ink/50">Sin pagos configurados.</p>
            </div>
            <ButtonLink
              href="/equipo/presupuestos"
              variant="outline-orange"
              className="w-auto shrink-0 !px-4 !py-2 text-xs"
            >
              Configurar pagos →
            </ButtonLink>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => (
              <div
                key={day.iso}
                className={`rounded-lg py-2 text-xs font-bold ${day.isToday ? "bg-electric text-white" : "bg-mist-soft text-ink/60"}`}
              >
                <div>{day.label}</div>
                <div>{day.dayNumber}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 border-t border-mist pt-3 text-xs font-bold uppercase text-ink/50">
            <Link href="/equipo/recordatorios" className="flex items-center gap-1.5">
              <Image src="/assets/interfaz/svg/recordatorios.svg" alt="" width={14} height={14} />
              Recordatorios
            </Link>
            <span className="text-ink/20">|</span>
            <span className="flex items-center gap-1.5">
              <Image src="/assets/interfaz/svg/calendario.svg" alt="" width={14} height={14} />
              Calendario iPhone
            </span>
          </div>
        </Card>
      </section>

      <Card className="clip-br-lg relative overflow-hidden !border-0 bg-electric p-5 text-white">
        <DiagonalLines className="right-0 top-0 h-24 w-32" />
        <p className="font-heading text-sm font-extrabold italic uppercase tracking-wider text-white/80">
          Disponible real
        </p>
        <p className="font-display text-4xl">{formatCents(available)}</p>
        <div className="relative mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div>
            <p className="text-white/70">Recibido</p>
            <p className="font-heading font-extrabold">{formatCents(received)}</p>
          </div>
          <div>
            <p className="text-white/70">Por cobrar</p>
            <p className="font-heading font-extrabold">{formatCents(receivable)}</p>
          </div>
          <div>
            <p className="text-white/70">Apartado</p>
            <p className="font-heading font-extrabold">{formatCents(reserved)}</p>
          </div>
        </div>
      </Card>

      <section className="flex flex-col gap-2">
        <SectionHeading>Reparto en equipo</SectionHeading>
        <Card className="!p-0 overflow-hidden">
          <div className="relative flex min-h-[180px]">
            <div
              className="flex-1 bg-electric px-3 pb-4 pt-5 text-white"
              style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
            >
              <Avatar avatarKey={memberA?.avatarKey ?? "CUSTOM"} avatarUrl={memberA?.avatarUrl} name={memberA?.name ?? "—"} size={48} />
              <p className="mt-2 font-heading text-lg font-extrabold uppercase italic">{memberA?.name ?? "—"}</p>
              <p className="fq-title text-4xl leading-none text-white">
                <span>{shareByUser[memberA?.id ?? ""] ?? "—"}%</span>
              </p>
              <p className="mt-3 text-xs text-white/70">Por cubrir</p>
              <p className="font-heading font-extrabold">$0</p>
              <p className="mt-1 text-[11px] text-white/60">
                Sueldo personal: {memberA && salaryByUser[memberA.id] ? formatCents(salaryByUser[memberA.id]) : "Sin definir"}
              </p>
            </div>
            <div
              className="-ml-10 flex-1 bg-orange px-3 pb-4 pt-5 text-right text-white"
              style={{ clipPath: "polygon(28% 0, 100% 0, 100% 100%, 12% 100%)" }}
            >
              <div className="flex justify-end">
                <Avatar avatarKey={memberB?.avatarKey ?? "CUSTOM"} avatarUrl={memberB?.avatarUrl} name={memberB?.name ?? "—"} size={48} />
              </div>
              <p className="mt-2 font-heading text-lg font-extrabold uppercase italic">{memberB?.name ?? "—"}</p>
              <p className="fq-title text-4xl leading-none text-white">
                <span>{shareByUser[memberB?.id ?? ""] ?? "—"}%</span>
              </p>
              <p className="mt-3 text-xs text-white/70">Por cubrir</p>
              <p className="font-heading font-extrabold">$0</p>
              <p className="mt-1 text-[11px] text-white/60">
                Sueldo personal: {memberB && salaryByUser[memberB.id] ? formatCents(salaryByUser[memberB.id]) : "Sin definir"}
              </p>
            </div>
          </div>
          <div className="p-4">
            <ButtonLink href="/equipo/sueldos">Definir sueldos →</ButtonLink>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-ink/50">
              <Image src="/assets/interfaz/svg/informacion.svg" alt="" width={13} height={13} />
              Su dinero personal, sin registrar en qué lo gastan.
            </p>
          </div>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeading>Ingresos y cobros</SectionHeading>
        <Link href="/equipo/ingresos">
          <Card className="flex flex-col gap-3">
            <Row label="Ingresos fijos" value={formatCents(incomeTotals.FIXED)} />
            <Row label="Clientes por cobrar" value={formatCents(incomeTotals.RECEIVABLE_CLIENT)} />
            <Row label="Extras" value={formatCents(incomeTotals.EXTRA)} />
          </Card>
        </Link>
        <p className="flex items-center gap-1.5 text-xs text-ink/50">
          <Image src="/assets/interfaz/svg/informacion.svg" alt="" width={13} height={13} />
          Solo lo cobrado cuenta como disponible.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <LinkTile href="/equipo/presupuestos" label="Presupuestos" />
        <LinkTile href="/equipo/movimientos" label="Movimientos" />
        <LinkTile href="/equipo/graficas" label="Gráficas" />
        <LinkTile href="/equipo/configuracion" label="Configuración" />
      </section>

      <Card className="clip-br-lg relative overflow-hidden !border-0 bg-electric p-4 text-white">
        <DiagonalLines className="right-0 top-0 h-20 w-28" />
        <p className="font-display text-2xl">FinQuest IA</p>
        <p className="text-white/80">Tu copiloto financiero</p>
        <ButtonLink href="/equipo/analisis" variant="outline" className="relative mt-3 !border-white !bg-white !text-ink">
          Analizar finanzas →
        </ButtonLink>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="font-sans text-sm font-bold text-ink">{label}</p>
        <p className="font-sans text-base font-extrabold text-ink">{value}</p>
      </div>
      <span className="shrink-0 text-lg font-extrabold text-electric" aria-hidden>
        →
      </span>
    </div>
  );
}

function LinkTile({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="relative flex flex-col gap-1 overflow-hidden rounded-xl border border-mist bg-white p-3 active:scale-[0.98]"
    >
      <CornerAccent color="electric" size={20} />
      <span className="font-heading font-bold">{label}</span>
      <span className="text-xs text-electric">Ver →</span>
    </Link>
  );
}

function buildWeek(today: Date) {
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + 1); // lunes

  return Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    return {
      iso: date.toISOString(),
      label: weekdayShort(date).slice(0, 3),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
    };
  });
}
