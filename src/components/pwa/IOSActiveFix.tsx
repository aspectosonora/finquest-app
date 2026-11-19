"use client";

import { useEffect } from "react";

/**
 * Safari en iOS no aplica el pseudo-selector :active (y por lo tanto clases
 * como active:scale-[0.98] ya usadas en Button/BottomNav) a menos que exista
 * un listener de touchstart en el documento. Sin esto, los botones no dan
 * ninguna respuesta visual inmediata al tocarlos en iPhone.
 */
export function IOSActiveFix() {
  useEffect(() => {
    const noop = () => {};
    document.addEventListener("touchstart", noop, { passive: true });
    return () => document.removeEventListener("touchstart", noop);
  }, []);

  return null;
}
