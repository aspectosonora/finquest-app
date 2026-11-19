"use client";

import { useId, useState } from "react";
import { formatCents } from "@/lib/finance/money";

export type BarListItem = {
  label: string;
  cents: number;
};

/**
 * Lista de barras horizontales de una sola serie (magnitud), con el extremo
 * redondeado, valor directo al final y una franja de foco/hover accesible.
 * No dibuja nada si no hay datos reales (nunca cifras ficticias).
 */
export function HorizontalBarList({ items, color = "electric" }: { items: BarListItem[]; color?: "electric" | "orange" }) {
  const groupId = useId();
  const [active, setActive] = useState<number | null>(null);
  const max = Math.max(1, ...items.map((i) => i.cents));
  const fill = color === "electric" ? "var(--color-electric)" : "var(--color-orange)";

  if (items.length === 0) return null;

  return (
    <ul className="flex flex-col gap-2" role="list">
      {items.map((item, index) => {
        const percent = Math.max(2, Math.round((item.cents / max) * 100));
        const isActive = active === index;
        return (
          <li key={`${groupId}-${item.label}`}>
            <button
              type="button"
              className="w-full text-left"
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(index)}
              onBlur={() => setActive(null)}
              aria-label={`${item.label}: ${formatCents(item.cents)}`}
            >
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-heading font-bold text-ink">{item.label}</span>
                <span className="font-heading font-bold text-ink/70">{formatCents(item.cents)}</span>
              </div>
              <div className="h-5 w-full overflow-hidden rounded-full bg-mist-soft">
                <div
                  className="h-full rounded-full transition-[width,opacity] duration-300"
                  style={{ width: `${percent}%`, backgroundColor: fill, opacity: isActive ? 1 : 0.85 }}
                />
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
