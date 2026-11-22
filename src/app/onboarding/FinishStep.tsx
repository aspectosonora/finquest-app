import { finishOnboardingAction } from "@/lib/finance/onboarding-actions";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmergencyFundQuickForm } from "@/components/finance/EmergencyFundQuickForm";

export function FinishStep({
  members,
  hasEmergencyFund,
  suggestedEmergencyFundCents,
}: {
  members: { name: string }[];
  hasEmergencyFund: boolean;
  suggestedEmergencyFundCents: number;
}) {
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

      {!hasEmergencyFund && (
        <Card className="flex flex-col gap-3">
          <div>
            <p className="font-heading font-extrabold uppercase">Fondo de emergencia</p>
            <p className="text-sm text-ink/60">
              Recomendado: ahorrar entre 3 y 6 meses de gastos para imprevistos, antes o junto con sus
              otras metas.
            </p>
          </div>
          <EmergencyFundQuickForm suggestedAmountPesos={suggestedEmergencyFundCents / 100} />
        </Card>
      )}

      <form action={finishOnboardingAction}>
        <Button type="submit">Comenzar la aventura →</Button>
      </form>
    </section>
  );
}
