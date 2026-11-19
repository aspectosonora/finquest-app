"use client";

import { useActionState } from "react";
import { createTeamAction, type AuthFormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

export function SignupForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    createTeamAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="teamName" placeholder="Nombre del equipo (opcional)" className="input" />
      <input name="name" placeholder="Tu nombre" required className="input" />
      <input name="email" type="email" placeholder="Correo" required className="input" autoComplete="email" />
      <input
        name="password"
        type="password"
        placeholder="Contraseña (mín. 8 caracteres)"
        required
        minLength={8}
        className="input"
        autoComplete="new-password"
      />
      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear equipo →"}
      </Button>
    </form>
  );
}
