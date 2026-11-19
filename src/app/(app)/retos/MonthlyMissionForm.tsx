"use client";

import { useActionState } from "react";
import {
  createMonthlyMissionAction,
  type MonthlyMissionFormState,
} from "@/lib/finance/monthly-mission";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function MonthlyMissionForm({ monthLabel }: { monthLabel: string }) {
  const [state, formAction, pending] = useActionState<MonthlyMissionFormState, FormData>(
    createMonthlyMissionAction,
    null
  );

  return (
    <Card>
      <p className="font-heading text-sm font-bold uppercase text-ink/60">
        Aún no configuran su misión de {monthLabel.toLowerCase()}
      </p>
      <form action={formAction} className="mt-2 flex flex-col gap-3">
        <input
          name="title"
          required
          defaultValue={`Misión ${monthLabel}`}
          placeholder="Título de la misión"
          className="input"
        />
        <textarea
          name="description"
          required
          rows={2}
          placeholder="¿Qué quieren lograr este mes?"
          className="input"
        />
        <input
          name="xpReward"
          type="number"
          min={1}
          required
          defaultValue={300}
          placeholder="XP de recompensa"
          className="input"
        />
        {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Configurar misión →"}
        </Button>
      </form>
    </Card>
  );
}
