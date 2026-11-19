"use client";

import { useEffectsToggle } from "@/lib/effects/EffectsProvider";

export function EffectsToggle() {
  const { enabled, setEnabled } = useEffectsToggle();

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-sans text-sm font-bold text-ink">Efectos y sonidos</p>
        <p className="text-xs text-ink/50">Confeti, celebraciones y animaciones al completar cosas.</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled(!enabled)}
        className="relative h-7 w-12 shrink-0 rounded-full transition-colors"
        style={{ background: enabled ? "var(--color-electric)" : "var(--color-mist)" }}
      >
        <span
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform"
          style={{ transform: enabled ? "translateX(22px)" : "translateX(4px)" }}
        />
      </button>
    </div>
  );
}
