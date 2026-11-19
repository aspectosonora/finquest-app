"use client";

import { useState } from "react";
import { formatCents } from "@/lib/finance/money";

export type GroupedBarGroup = {
  label: string;
  a: number; // centavos, serie A (electric)
  b: number; // centavos, serie B (orange)
};

export function GroupedBarChart({
  groups,
  seriesALabel,
  seriesBLabel,
}: {
  groups: GroupedBarGroup[];
  seriesALabel: string;
  seriesBLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const max = Math.max(1, ...groups.flatMap((g) => [g.a, g.b]));

  if (groups.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-4 text-xs font-bold uppercase text-ink/60">
        <LegendSwatch color="electric" label={seriesALabel} />
        <LegendSwatch color="orange" label={seriesBLabel} />
      </div>

      <div className="flex items-end gap-3 overflow-x-auto pb-2">
        {groups.map((group) => (
          <div key={group.label} className="flex min-w-[56px] flex-col items-center gap-1">
            <div className="flex h-32 items-end gap-1">
              <Bar
                cents={group.a}
                max={max}
                color="electric"
                active={active === `${group.label}-a`}
                onHover={(v) => setActive(v ? `${group.label}-a` : null)}
                label={`${group.label} · ${seriesALabel}`}
              />
              <Bar
                cents={group.b}
                max={max}
                color="orange"
                active={active === `${group.label}-b`}
                onHover={(v) => setActive(v ? `${group.label}-b` : null)}
                label={`${group.label} · ${seriesBLabel}`}
              />
            </div>
            <span className="text-[11px] font-bold uppercase text-ink/50">{group.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Bar({
  cents,
  max,
  color,
  active,
  onHover,
  label,
}: {
  cents: number;
  max: number;
  color: "electric" | "orange";
  active: boolean;
  onHover: (v: boolean) => void;
  label: string;
}) {
  const heightPercent = Math.max(2, Math.round((Math.abs(cents) / max) * 100));
  const fill = color === "electric" ? "var(--color-electric)" : "var(--color-orange)";

  return (
    <button
      type="button"
      className="relative flex h-full w-5 items-end justify-center"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      onFocus={() => onHover(true)}
      onBlur={() => onHover(false)}
      aria-label={`${label}: ${formatCents(cents)}`}
    >
      {active && (
        <span className="absolute -top-6 whitespace-nowrap rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white">
          {formatCents(cents)}
        </span>
      )}
      <span
        className="w-full rounded-t-[4px] transition-opacity"
        style={{ height: `${heightPercent}%`, backgroundColor: fill, opacity: active ? 1 : 0.85 }}
      />
    </button>
  );
}

function LegendSwatch({ color, label }: { color: "electric" | "orange"; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color === "electric" ? "var(--color-electric)" : "var(--color-orange)" }}
      />
      {label}
    </span>
  );
}
