"use client";

import { useActionState, useMemo, useState } from "react";
import {
  registerFixedExpensePaymentAction,
  type FixedExpenseFormState,
} from "@/lib/finance/fixed-expenses-actions";
import { formatCents, pesosToCents } from "@/lib/finance/money";
import { Button } from "@/components/ui/Button";

type FixedExpenseTypeOption = {
  id: string;
  name: string;
  responsibleUserId: string;
  responsibleUserName: string;
  responsiblePercent: number;
  otherUserName: string | null;
};

export function FixedExpenseCaptureForm({ types }: { types: FixedExpenseTypeOption[] }) {
  const [state, formAction, pending] = useActionState<FixedExpenseFormState, FormData>(
    registerFixedExpensePaymentAction,
    null
  );
  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [fixedExpenseTypeId, setFixedExpenseTypeId] = useState(types[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [occurredAt, setOccurredAt] = useState(() => new Date().toISOString().slice(0, 10));

  const selected = types.find((t) => t.id === fixedExpenseTypeId) ?? null;

  const preview = useMemo(() => {
    const value = Number(amount);
    if (!selected || !value || value <= 0) return null;
    const amountCents = pesosToCents(value);
    const responsibleShareCents = Math.round((amountCents * selected.responsiblePercent) / 100);
    const otherShareCents = amountCents - responsibleShareCents;
    return { responsibleShareCents, otherShareCents };
  }, [amount, selected]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <Field label="¿Cuál gasto fijo?">
        <select
          name="fixedExpenseTypeId"
          required
          className="input"
          value={fixedExpenseTypeId}
          onChange={(e) => setFixedExpenseTypeId(e.target.value)}
        >
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — le toca a {t.responsibleUserName}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Importe total (MXN)">
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
        <input
          name="occurredAt"
          type="date"
          value={occurredAt}
          onChange={(e) => setOccurredAt(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Nota (opcional)">
        <input name="note" value={note} onChange={(e) => setNote(e.target.value)} className="input" />
      </Field>

      {preview && selected && (
        <div className="rounded-xl bg-mist-soft p-3 text-sm font-bold text-ink/70">
          {preview.otherShareCents > 0 ? (
            <>
              A {selected.responsibleUserName} le toca {formatCents(preview.responsibleShareCents)}.{" "}
              {selected.otherUserName ?? "Tu pareja"} le debe transferir{" "}
              {formatCents(preview.otherShareCents)}.
            </>
          ) : (
            <>Todo el importe le corresponde a {selected.responsibleUserName}.</>
          )}
        </div>
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
