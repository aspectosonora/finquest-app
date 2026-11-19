"use client";

import { useActionState } from "react";
import { updateTeamNameAction, type SettingsFormState } from "@/lib/finance/settings-actions";
import { Button } from "@/components/ui/Button";

export function TeamNameForm({ name }: { name: string }) {
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    updateTeamNameAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="name" defaultValue={name} required maxLength={60} className="input" />
      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-auto px-6">
        {pending ? "Guardando..." : "Guardar"}
      </Button>
    </form>
  );
}
