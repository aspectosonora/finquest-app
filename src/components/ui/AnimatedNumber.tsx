"use client";

import { useEffect, useRef, useState } from "react";
import { useEffectsEnabled } from "@/lib/effects/EffectsProvider";
import { formatCents } from "@/lib/finance/money";

/**
 * Anima un número entero de centavos cuando cambia mientras el componente
 * sigue montado -- típicamente tras una acción del servidor que refresca
 * los datos de la página. En el primer render muestra el valor final
 * directamente, sin animar desde cero. No recibe la función de formato
 * como prop porque un Server Component no puede pasar funciones a un
 * Client Component; usa formatCents directamente.
 */
export function AnimatedNumber({
  value,
  durationMs = 600,
  className,
}: {
  value: number;
  durationMs?: number;
  className?: string;
}) {
  const format = formatCents;
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const enabled = useEffectsEnabled();
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;
    if (from === to) return;

    if (!enabled) {
      setDisplay(to);
      return;
    }

    setPulse(true);
    const start = performance.now();
    let raf = 0;
    function tick(now: number) {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPulse(false);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, enabled, durationMs]);

  return <span className={`inline-block ${pulse ? "fx-count-pulse" : ""} ${className ?? ""}`}>{format(display)}</span>;
}
