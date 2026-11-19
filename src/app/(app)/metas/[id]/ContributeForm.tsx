"use client";

import { useActionState, useState } from "react";
import { registerMovementAction, type CaptureFormState } from "@/lib/finance/movements";
import { Button } from "@/components/ui/Button";

export function ContributeForm({
  goalId,
  members,
}: {
  goalId: string;
  members: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState<CaptureFormState, FormData>(
    registerMovementAction,
    null
  );
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-mist bg-white p-4">
      <input type="hidden" name="tipo" value="APORTACION_META" />
      <input type="hidden" name="goalId" value={goalId} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />

      <p className="font-heading text-lg font-extrabold uppercase">Registrar aportación</p>

      <select name="userId" required className="input" defaultValue="">
        <option value="" disabled>
          ¿Quién aporta?
        </option>
        {members.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <input name="amount" type="number" min={1} step="0.01" required placeholder="Importe (MXN)" className="input" />
      <input name="occurredAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input" />
      <input name="note" placeholder="Nota (opcional)" className="input" />

      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Registrando..." : "Registrar aportación →"}
      </Button>
    </form>
  );
}
