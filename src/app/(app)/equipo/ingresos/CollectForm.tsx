"use client";

import { useActionState, useState } from "react";
import { collectIncomePaymentAction, type IncomeFormState } from "@/lib/finance/income-actions";

export function CollectForm({
  paymentId,
  pendingAmountCents,
}: {
  paymentId: string;
  pendingAmountCents: number;
}) {
  const [state, formAction, pending] = useActionState<IncomeFormState, FormData>(
    collectIncomePaymentAction,
    null
  );
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  return (
    <form action={formAction} className="flex items-center gap-1">
      <input type="hidden" name="paymentId" value={paymentId} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input
        name="receivedAmount"
        type="number"
        min={0.01}
        step="0.01"
        defaultValue={pendingAmountCents > 0 ? pendingAmountCents / 100 : undefined}
        className="w-24 rounded-md border border-mist px-2 py-1 text-sm"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-electric px-2 py-1 font-heading text-xs font-bold text-white"
      >
        Cobrar
      </button>
      {state?.error && <span className="text-xs text-orange-dark">{state.error}</span>}
    </form>
  );
}
