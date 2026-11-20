"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { reportPaint } from "@/lib/perf/nav-timing";

/**
 * Transición ligera (ver fx-route-fade en globals.css, ~160ms) al cambiar de
 * pantalla. Se reinicia por el cambio de "key" en cada pathname; respeta
 * prefers-reduced-motion vía la regla global existente.
 */
export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // Doble rAF: el commit de React ya pasó, dos vueltas de frame es una
    // aproximación razonable de "ya se pintó" sin depender de APIs
    // experimentales. Instrumentación temporal, ver nav-timing.ts.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        reportPaint(pathname);
      });
    });
  }, [pathname]);

  return (
    <div key={pathname} className="fx-route-fade">
      {children}
    </div>
  );
}
