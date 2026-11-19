import { finishOnboardingAction } from "@/lib/finance/onboarding-actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function FinishStep({ members }: { members: { name: string }[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-extrabold uppercase">3. ¡Listo para empezar!</h2>
      <Card>
        <p className="text-ink/70">
          {members.map((m) => m.name).join(" y ")} ya confirmaron su equipo y su reparto. El resto de la
          configuración (deudas, ingresos, metas, sueldos y presupuestos) la capturan juntos desde Inicio,
          Deudas, Metas y Equipo cuando gusten — no hace falta llenarla toda de una vez.
        </p>
      </Card>
      <form action={finishOnboardingAction}>
        <Button type="submit">Comenzar la aventura →</Button>
      </form>
    </section>
  );
}
