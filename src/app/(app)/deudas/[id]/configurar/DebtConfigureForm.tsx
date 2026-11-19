"use client";

import { useActionState, useState } from "react";
import { configureDebtAction, type DebtFormState } from "@/lib/finance/debt-actions";
import { Button } from "@/components/ui/Button";
import type { DebtModel, UserModel } from "@/generated/prisma/models";

export function DebtConfigureForm({
  debt,
  members,
}: {
  debt: DebtModel;
  members: Pick<UserModel, "id" | "name">[];
}) {
  const [state, formAction, pending] = useActionState<DebtFormState, FormData>(
    configureDebtAction,
    null
  );
  const [shared, setShared] = useState(debt.isShared);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="debtId" value={debt.id} />

      <Field label="Nombre">
        <input name="name" defaultValue={debt.name} required className="input" />
      </Field>

      <Field label="Saldo pendiente actual (MXN)">
        <input
          name="initialAmount"
          type="number"
          min={0}
          step="0.01"
          defaultValue={debt.initialAmountCents ? debt.initialAmountCents / 100 : ""}
          required
          className="input"
        />
      </Field>

      <label className="flex items-center gap-2 font-heading font-bold">
        <input
          type="checkbox"
          name="isShared"
          defaultChecked={debt.isShared}
          onChange={(e) => setShared(e.target.checked)}
        />
        Es una deuda compartida
      </label>

      {!shared && (
        <Field label="Responsable">
          <select name="ownerId" defaultValue={debt.ownerId ?? ""} className="input">
            <option value="">Selecciona...</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label="Día de vencimiento (opcional)">
        <input
          name="dueDayOfMonth"
          type="number"
          min={1}
          max={31}
          defaultValue={debt.dueDayOfMonth ?? ""}
          className="input"
        />
      </Field>

      <Field label="Pago mensual (opcional)">
        <input
          name="monthlyPayment"
          type="number"
          min={0}
          step="0.01"
          defaultValue={debt.monthlyPaymentCents ? debt.monthlyPaymentCents / 100 : ""}
          className="input"
        />
      </Field>

      <Field label="Tasa de interés anual % (opcional)">
        <input
          name="interestRate"
          type="number"
          min={0}
          step="0.01"
          defaultValue={debt.interestRateBp ? debt.interestRateBp / 100 : ""}
          className="input"
        />
      </Field>

      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-heading text-sm font-bold uppercase tracking-wide text-ink/70">
        {label}
      </span>
      {children}
    </label>
  );
}
