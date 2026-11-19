"use client";

import { useActionState, useState } from "react";
import { createIncomeSourceAction, type IncomeFormState } from "@/lib/finance/income-actions";
import { Button } from "@/components/ui/Button";

export function NewIncomeForm({ members }: { members: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<IncomeFormState, FormData>(
    createIncomeSourceAction,
    null
  );
  const [isVariable, setIsVariable] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Tipo">
        <select name="type" className="input" defaultValue="FIXED">
          <option value="FIXED">Ingreso fijo</option>
          <option value="RECEIVABLE_CLIENT">Cliente por cobrar</option>
          <option value="EXTRA">Extra</option>
        </select>
      </Field>

      <Field label="Nombre">
        <input name="name" required className="input" placeholder="Tecmilenio, Cliente X, Tocada..." />
      </Field>

      <Field label="Integrante">
        <select name="ownerId" required className="input" defaultValue="">
          <option value="" disabled>
            Selecciona...
          </option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>

      <label className="flex items-center gap-2 font-heading font-bold">
        <input type="checkbox" name="isVariable" checked={isVariable} onChange={(e) => setIsVariable(e.target.checked)} />
        El monto es variable
      </label>

      {!isVariable && (
        <Field label="Monto esperado (MXN)">
          <input name="amount" type="number" min={0} step="0.01" className="input" />
        </Field>
      )}

      <Field label="Frecuencia">
        <select name="frequency" className="input" defaultValue="MONTHLY">
          <option value="WEEKLY">Semanal</option>
          <option value="BIWEEKLY">Quincenal</option>
          <option value="MONTHLY">Mensual</option>
          <option value="ONE_TIME">Única vez</option>
          <option value="IRREGULAR">Irregular</option>
        </select>
      </Field>

      <Field label="Fecha esperada de cobro (opcional)">
        <input name="expectedDate" type="date" className="input" />
      </Field>

      <Field label="Notas (opcional)">
        <textarea name="notes" className="input" rows={3} />
      </Field>

      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar fuente de ingreso →"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-heading text-sm font-bold uppercase tracking-wide text-ink/70">{label}</span>
      {children}
    </label>
  );
}
