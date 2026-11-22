"use client";

import { useActionState, useState } from "react";
import {
  createFixedExpenseTypeAction,
  deleteFixedExpenseTypeAction,
  type FixedExpenseFormState,
} from "@/lib/finance/fixed-expenses-actions";
import { Button } from "@/components/ui/Button";

type FixedExpenseType = {
  id: string;
  name: string;
  responsibleUserId: string;
  responsibleUser: { name: string };
  currentTurnUserId: string;
};

export function FixedExpenseTypesManager({
  members,
  fixedExpenseTypes,
}: {
  members: { id: string; name: string }[];
  fixedExpenseTypes: FixedExpenseType[];
}) {
  const [state, formAction, pending] = useActionState<FixedExpenseFormState, FormData>(
    createFixedExpenseTypeAction,
    null
  );
  const [name, setName] = useState("");
  const nameById = Object.fromEntries(members.map((m) => [m.id, m.name]));

  return (
    <div className="flex flex-col gap-4">
      {fixedExpenseTypes.length > 0 && (
        <ul className="flex flex-col gap-2">
          {fixedExpenseTypes.map((t) => (
            <li
              key={t.id}
              className="flex items-center justify-between gap-2 rounded-xl bg-mist-soft px-3 py-2"
            >
              <div>
                <p className="font-heading font-bold">{t.name}</p>
                <p className="text-xs text-ink/50">
                  Le toca ahora a {nameById[t.currentTurnUserId] ?? t.responsibleUser.name}
                </p>
              </div>
              <form action={deleteFixedExpenseTypeAction}>
                <input type="hidden" name="id" value={t.id} />
                <button
                  type="submit"
                  className="font-heading text-xs font-bold text-orange-dark underline"
                >
                  Eliminar
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <form action={formAction} className="flex flex-col gap-3 border-t border-mist pt-3">
        <label className="flex flex-col gap-1">
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-ink/70">
            Nombre (p. ej. Luz, Agua, Internet)
          </span>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-heading text-sm font-bold uppercase tracking-wide text-ink/70">
            ¿Quién empieza pagándolo?
          </span>
          <select name="responsibleUserId" className="input" required defaultValue="">
            <option value="" disabled>
              Selecciona...
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <span className="text-xs text-ink/50">
            Después se alterna solo: si le tocó a uno esta vez, la próxima le toca al otro.
          </span>
        </label>
        {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}
        <Button type="submit" disabled={pending} className="w-auto px-6">
          {pending ? "Agregando..." : "Agregar gasto fijo"}
        </Button>
      </form>
    </div>
  );
}
