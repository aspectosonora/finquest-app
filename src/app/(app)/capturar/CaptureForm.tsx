"use client";

import { useActionState, useMemo, useState } from "react";
import { registerMovementAction, type CaptureFormState } from "@/lib/finance/movements";
import { formatCents, pesosToCents } from "@/lib/finance/money";
import { Button } from "@/components/ui/Button";

const EFFECT_LABEL: Record<string, (amount: string) => string> = {
  INGRESO_COBRADO: (a) => `Su disponible aumentará en ${a}.`,
  GASTO: (a) => `Su disponible disminuirá en ${a}.`,
  PAGO: (a) => `Su disponible disminuirá en ${a}.`,
  ABONO_DEUDA: (a) => `Su disponible disminuirá en ${a} y el saldo de la deuda bajará lo mismo.`,
  APARTAR: (a) => `Apartarán ${a}; dejará de contarse como disponible libre.`,
  LIBERAR_SUELDO: (a) => `Se liberarán ${a} como dinero personal; ya no contará como disponible del equipo.`,
};

export function CaptureForm({
  tipo,
  members,
  debts,
  budgets,
}: {
  tipo: string;
  members: { id: string; name: string }[];
  debts?: { id: string; name: string }[];
  budgets?: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<CaptureFormState, FormData>(
    registerMovementAction,
    null
  );
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [amount, setAmount] = useState("");

  const effectText = useMemo(() => {
    const value = Number(amount);
    if (!value || value <= 0) return null;
    return EFFECT_LABEL[tipo]?.(formatCents(pesosToCents(value))) ?? null;
  }, [amount, tipo]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      {tipo === "ABONO_DEUDA" && debts && (
        <>
          <Field label="Deuda">
            <select name="debtId" required className="input" defaultValue="">
              <option value="" disabled>
                Selecciona...
              </option>
              {debts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 font-heading font-bold">
            <input type="checkbox" name="isExtraordinary" />
            Es un pago extraordinario (adicional al plan)
          </label>
        </>
      )}

      {(tipo === "GASTO" || tipo === "PAGO") && budgets && budgets.length > 0 && (
        <Field label="Categoría de presupuesto (opcional)">
          <select name="budgetCategoryId" className="input" defaultValue="">
            <option value="">Sin categoría</option>
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </Field>
      )}

      <Field label={tipo === "LIBERAR_SUELDO" ? "¿De quién es el sueldo?" : "Integrante"}>
        <select name="userId" className="input" defaultValue="">
          <option value="">{tipo === "LIBERAR_SUELDO" ? "Selecciona..." : "Equipo (compartido)"}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Importe (MXN)">
        <input
          name="amount"
          type="number"
          min={0.01}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Fecha">
        <input name="occurredAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input" />
      </Field>

      <Field label="Nota (opcional)">
        <input name="note" className="input" />
      </Field>

      {effectText && (
        <div className="rounded-xl bg-mist-soft p-3 text-sm font-bold text-ink/70">{effectText}</div>
      )}

      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Confirmar →"}
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
