"use client";

import { useActionState, useState } from "react";
import { setTeamSplitAction, type OnboardingFormState } from "@/lib/finance/onboarding-actions";
import { Button } from "@/components/ui/Button";

export function SplitForm({ members }: { members: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<OnboardingFormState, FormData>(
    setTeamSplitAction,
    null
  );
  const [julioPercent, setJulioPercent] = useState(65);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex items-center justify-between font-heading text-lg font-extrabold">
        <span className="text-electric">
          {members[0]?.name ?? "Integrante 1"} {julioPercent}%
        </span>
        <span className="text-orange">
          {members[1]?.name ?? "Integrante 2"} {100 - julioPercent}%
        </span>
      </div>
      <input
        type="range"
        name="julioPercent"
        min={0}
        max={100}
        value={julioPercent}
        onChange={(e) => setJulioPercent(Number(e.target.value))}
        className="w-full"
      />

      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Confirmar reparto →"}
      </Button>
    </form>
  );
}
