"use client";

import { useActionState } from "react";
import { loginAction, type AuthFormState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(loginAction, null);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input name="email" type="email" placeholder="Correo" required className="input" autoComplete="email" />
      <input
        name="password"
        type="password"
        placeholder="Contraseña"
        required
        className="input"
        autoComplete="current-password"
      />
      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Entrar →"}
      </Button>
    </form>
  );
}
