"use client";

import { usePathname } from "next/navigation";

/**
 * Transición ligera (ver fx-route-fade en globals.css, ~160ms) al cambiar de
 * pantalla. Se reinicia por el cambio de "key" en cada pathname; respeta
 * prefers-reduced-motion vía la regla global existente.
 */
export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="fx-route-fade">
      {children}
    </div>
  );
}
