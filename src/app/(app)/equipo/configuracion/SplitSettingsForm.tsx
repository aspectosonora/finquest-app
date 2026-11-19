"use client";

import { useActionState, useState } from "react";
import { updateTeamSplitAction, type SettingsFormState } from "@/lib/finance/settings-actions";
import { Button } from "@/components/ui/Button";

export function SplitSettingsForm({
  members,
  currentJulioPercent,
}: {
  members: { id: string; name: string }[];
  currentJulioPercent: number;
}) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateTeamSplitAction,
    null
  );
  const [julioPercent, setJulioPercent] = useState(currentJulioPercent);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="flex items-center justify-between font-heading font-extrabold">
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
      <Button type="submit" disabled={pending} className="w-auto px-6">
        {pending ? "Guardando..." : "Actualizar reparto"}
      </Button>
    </form>
  );
}
