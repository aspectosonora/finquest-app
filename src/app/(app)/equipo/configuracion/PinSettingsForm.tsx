"use client";

import { useActionState } from "react";
import { setPinAction, removePinAction, type AuthFormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

export function PinSettingsForm({ hasPinSet }: { hasPinSet: boolean }) {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(setPinAction, null);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-ink/60">
        {hasPinSet
          ? "Ya tienes un código configurado para entrar más rápido. Puedes cambiarlo:"
          : "Configura un código numérico (4 a 6 dígitos) para entrar sin escribir tu correo y contraseña."}
      </p>
      <form action={formAction} className="flex items-center gap-2">
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="Nuevo código"
          required
          className="input flex-1"
        />
        <Button type="submit" disabled={pending} className="w-auto shrink-0">
          {pending ? "Guardando..." : hasPinSet ? "Cambiar" : "Activar"}
        </Button>
      </form>
      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}
      {hasPinSet && (
        <form action={removePinAction}>
          <button type="submit" className="text-sm font-bold text-ink/50 underline">
            Desactivar código
          </button>
        </form>
      )}
    </div>
  );
}
