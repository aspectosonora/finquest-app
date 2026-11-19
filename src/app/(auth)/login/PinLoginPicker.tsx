"use client";

import { useState } from "react";
import { useActionState } from "react";
import { loginWithPinAction, type AuthFormState } from "@/lib/auth/actions";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";

type Profile = { id: string; name: string; avatarKey: string; avatarUrl: string | null };

export function PinLoginPicker({
  users,
  onUseEmail,
}: {
  users: Profile[];
  onUseEmail: () => void;
}) {
  const [selected, setSelected] = useState<Profile | null>(null);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(loginWithPinAction, null);

  if (!selected) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm text-ink/60">¿Quién eres?</p>
        <div className="flex justify-center gap-6">
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelected(user)}
              className="flex flex-col items-center gap-2 active:scale-95"
            >
              <Avatar avatarKey={user.avatarKey} avatarUrl={user.avatarUrl} name={user.name} size={72} />
              <span className="font-heading font-bold text-ink">{user.name}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onUseEmail}
          className="text-center text-sm font-bold text-electric underline"
        >
          Entrar con correo y contraseña
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-center gap-4">
      <input type="hidden" name="userId" value={selected.id} />
      <Avatar avatarKey={selected.avatarKey} avatarUrl={selected.avatarUrl} name={selected.name} size={72} />
      <p className="font-heading font-bold text-ink">{selected.name}</p>
      <input
        name="pin"
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        placeholder="Código"
        required
        autoFocus
        className="input text-center text-2xl tracking-[0.5em]"
      />
      {state?.error && <p className="text-center text-sm font-bold text-orange-dark">{state.error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Entrando..." : "Entrar →"}
      </Button>
      <button
        type="button"
        onClick={() => setSelected(null)}
        className="text-sm font-bold text-ink/50 underline"
      >
        No soy yo
      </button>
    </form>
  );
}
