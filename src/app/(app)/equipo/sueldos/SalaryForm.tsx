"use client";

import { useActionState } from "react";
import { setPersonalSalariesAction, type SalaryFormState } from "@/lib/finance/salary-actions";
import { Button } from "@/components/ui/Button";

export function SalaryForm({
  members,
}: {
  members: { id: string; name: string; desiredAmountCents: number }[];
}) {
  const [state, formAction, pending] = useActionState<SalaryFormState, FormData>(
    setPersonalSalariesAction,
    null
  );

  const fieldNames = ["julioAmount", "cinthyaAmount"] as const;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {members.map((member, index) => (
        <label key={member.id} className="flex flex-col gap-1">
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-ink/70">
            {member.name}
          </span>
          <input
            name={fieldNames[index]}
            type="number"
            min={0}
            step="0.01"
            defaultValue={member.desiredAmountCents ? member.desiredAmountCents / 100 : ""}
            className="input"
          />
        </label>
      ))}

      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
