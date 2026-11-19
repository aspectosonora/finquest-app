"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import { createGoalAction, type GoalFormState } from "@/lib/finance/goal-actions";
import { calculateGoal } from "@/lib/finance/goal-calc";
import { formatCents, pesosToCents } from "@/lib/finance/money";
import { Button } from "@/components/ui/Button";
import type { GoalCategoryMeta } from "@/lib/constants/goals";

export function NewGoalForm({
  categories,
  defaultCategory,
  members,
  defaultJulioPercent,
  hasSplit,
}: {
  categories: GoalCategoryMeta[];
  defaultCategory?: string;
  members: { id: string; name: string }[];
  defaultJulioPercent: number;
  hasSplit: boolean;
}) {
  const [state, formAction, pending] = useActionState<GoalFormState, FormData>(
    createGoalAction,
    null
  );

  const [category, setCategory] = useState(defaultCategory ?? categories[0]?.category);
  const [mode, setMode] = useState<"BY_DATE" | "BY_BUDGET">("BY_DATE");
  const [targetAmount, setTargetAmount] = useState("");
  const [initialSaved, setInitialSaved] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [julioPercent, setJulioPercent] = useState(defaultJulioPercent);
  const [photoPath, setPhotoPath] = useState("");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const preview = useMemo(() => {
    const targetCents = Number(targetAmount) > 0 ? pesosToCents(Number(targetAmount)) : 0;
    const savedCents = Number(initialSaved) > 0 ? pesosToCents(Number(initialSaved)) : 0;
    if (targetCents <= 0 || members.length !== 2) return null;

    const remainingInstallments =
      mode === "BY_DATE" && targetDate ? monthsBetween(new Date(), new Date(targetDate)) : 0;

    return calculateGoal({
      targetAmountCents: targetCents,
      accumulatedCents: savedCents,
      mode,
      remainingInstallments,
      monthlyBudgetCents: Number(monthlyBudget) > 0 ? pesosToCents(Number(monthlyBudget)) : 0,
      shares: [
        { userId: members[0].id, percent: julioPercent },
        { userId: members[1].id, percent: 100 - julioPercent },
      ],
    });
  }, [targetAmount, initialSaved, mode, targetDate, monthlyBudget, julioPercent, members]);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const body = new FormData();
      body.set("file", file);
      const res = await fetch("/api/uploads/goal-photo", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo subir la foto.");
      setPhotoPath(data.path);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "No se pudo subir la foto.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="photoPath" value={photoPath} />
      {hasSplit && <input type="hidden" name="splitJulio" value={julioPercent} />}

      <Field label="Foto (opcional)">
        <label className="flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-mist bg-white">
          {photoPreview ? (
            <Image src={photoPreview} alt="" width={200} height={128} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-ink/50">Toca para subir una foto</span>
          )}
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePhotoChange} />
        </label>
        {uploading && <p className="text-xs text-ink/50">Subiendo...</p>}
        {uploadError && <p className="text-xs font-bold text-orange-dark">{uploadError}</p>}
      </Field>

      <Field label="Nombre de la meta">
        <input name="name" required className="input" placeholder="Nuestro nuevo comedor" />
      </Field>

      <Field label="Categoría">
        <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="input">
          {categories.map((c) => (
            <option key={c.category} value={c.category}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Monto objetivo (MXN)">
        <input
          name="targetAmount"
          type="number"
          min={1}
          step="0.01"
          required
          value={targetAmount}
          onChange={(e) => setTargetAmount(e.target.value)}
          className="input"
        />
      </Field>

      <Field label="Ahorro ya acumulado (opcional)">
        <input
          name="initialSavedAmount"
          type="number"
          min={0}
          step="0.01"
          value={initialSaved}
          onChange={(e) => setInitialSaved(e.target.value)}
          className="input"
        />
      </Field>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("BY_DATE")}
          className={`flex-1 rounded-xl border-2 py-2 font-heading font-bold ${mode === "BY_DATE" ? "border-electric bg-electric text-white" : "border-mist"}`}
        >
          Por fecha
        </button>
        <button
          type="button"
          onClick={() => setMode("BY_BUDGET")}
          className={`flex-1 rounded-xl border-2 py-2 font-heading font-bold ${mode === "BY_BUDGET" ? "border-electric bg-electric text-white" : "border-mist"}`}
        >
          Por presupuesto
        </button>
      </div>
      <input type="hidden" name="mode" value={mode} />

      {mode === "BY_DATE" ? (
        <Field label="Fecha deseada">
          <input
            name="targetDate"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="input"
          />
        </Field>
      ) : (
        <Field label="Ahorro mensual disponible (MXN)">
          <input
            name="monthlyBudget"
            type="number"
            min={1}
            step="0.01"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            className="input"
          />
        </Field>
      )}

      {hasSplit && (
        <Field label={`Reparto: ${members[0].name} ${julioPercent}% · ${members[1].name} ${100 - julioPercent}%`}>
          <input
            type="range"
            min={0}
            max={100}
            value={julioPercent}
            onChange={(e) => setJulioPercent(Number(e.target.value))}
            className="w-full"
          />
        </Field>
      )}

      <label className="flex items-center gap-2 font-heading font-bold">
        <input type="checkbox" name="isPrimary" />
        Marcar como misión principal
      </label>

      {preview && (
        <div className="rounded-xl bg-electric p-3 text-white">
          <p className="font-heading text-sm font-extrabold uppercase italic">Vista previa</p>
          <p className="font-display text-xl">
            {formatCents(preview.monthlyRequiredCents)} al mes
            {mode === "BY_DATE" && ` · ${preview.remainingInstallments} mensualidades`}
            {mode === "BY_BUDGET" && ` · ${preview.remainingInstallments} meses`}
          </p>
          {hasSplit && (
            <div className="mt-1 flex gap-4 text-sm">
              {preview.perMember.map((s, i) => (
                <span key={s.userId}>
                  {members[i].name}: {formatCents(s.amountCents)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {state?.error && <p className="text-sm font-bold text-orange-dark">{state.error}</p>}

      <Button type="submit" disabled={pending || uploading}>
        {pending ? "Guardando..." : "Crear meta →"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="font-heading text-sm font-bold uppercase tracking-wide text-ink/70">{label}</span>
      {children}
    </label>
  );
}

function monthsBetween(from: Date, to: Date) {
  const months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  return Math.max(0, months);
}
