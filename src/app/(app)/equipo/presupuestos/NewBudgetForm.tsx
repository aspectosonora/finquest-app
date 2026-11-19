"use client";

import { useActionState } from "react";
import { createBudgetCategoryAction, type BudgetFormState } from "@/lib/finance/budget-actions";
import { Button } from "@/components/ui/Button";

const SUGGESTIONS = [
  "Supermercado",
  "Salidas",
  "Restaurantes",
  "Gasolina",
  "Servicios",
  "Entretenimiento",
  "Suscripciones",
  "Regalos",
  "Hogar",
];

export function NewBudgetForm() {
  const [state, formAction, pending] = useActionState<BudgetFormState, FormData>(
    createBudgetCategoryAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-mist bg-white p-4">
      <p className="font-heading text-lg font-extrabold uppercase">Nueva categoría</p>
      <input name="name" list="budget-suggestions" required placeholder="Supermercado" className="input" />
      <datalist id="budget-suggestions">
        {SUGGESTIONS.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
      <input
        name="monthlyLimit"
        type="number"
        min={1}
        step="0.01"
        required
        placeholder="Presupuesto mensual (MXN)"
        className="input"
      />
      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Agregar categoría →"}
      </Button>
    </form>
  );
}
