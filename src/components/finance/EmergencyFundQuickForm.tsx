"use client";

import { useActionState, useState } from "react";
import {
  createEmergencyFundGoalAction,
  type EmergencyFundFormState,
} from "@/lib/finance/emergency-fund-actions";
import { Button } from "@/components/ui/Button";

export function EmergencyFundQuickForm({
  suggestedAmountPesos,
  redirectTo,
}: {
  suggestedAmountPesos: number;
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState<EmergencyFundFormState, FormData>(
    createEmergencyFundGoalAction,
    null
  );
  const [amount, setAmount] = useState(suggestedAmountPesos > 0 ? String(suggestedAmountPesos) : "");

  return (
    <form action={formAction} className="flex flex-col gap-2">
      {redirectTo && <input type="hidden" name="redirectTo" value={redirectTo} />}
      <label className="flex flex-col gap-1">
        <span className="font-heading text-sm font-bold uppercase tracking-wide text-ink/70">
          Meta del fondo (MXN)
        </span>
        <input
          name="targetAmount"
          type="number"
          min={0.01}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
        />
      </label>
      {suggestedAmountPesos > 0 ? (
        <p className="text-xs text-ink/50">
          Sugerido: ~4 meses de sus gastos fijos/presupuestos ya configurados. Pueden ajustarlo.
        </p>
      ) : (
        <p className="text-xs text-ink/50">
          Aún no tienen presupuestos o gastos fijos configurados para sugerir un monto; ingresen el que
          gusten y lo ajustan después.
        </p>
      )}
      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}
      <Button type="submit" disabled={pending} variant="outline" className="w-auto px-5">
        {pending ? "Creando..." : "Crear fondo de emergencia"}
      </Button>
    </form>
  );
}
