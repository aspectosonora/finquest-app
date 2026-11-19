"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const MIN_INTERVAL_MS = 10_000;
const BACKGROUND_POLL_MS = 45_000;

/**
 * Mantiene las pantallas al día sin que el usuario tenga que recargar:
 * refresca al volver a primer plano (ej. tras registrar algo desde el otro
 * iPhone) y, mientras la app sigue visible, cada cierto tiempo de fondo.
 * router.refresh() vuelve a pedir los Server Components de la ruta actual
 * sin perder el estado de los componentes cliente ni el scroll.
 */
export function LiveSync() {
  const router = useRouter();
  const lastRefresh = useRef(0);

  useEffect(() => {
    function refreshIfDue() {
      const now = Date.now();
      if (now - lastRefresh.current < MIN_INTERVAL_MS) return;
      lastRefresh.current = now;
      router.refresh();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") refreshIfDue();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", refreshIfDue);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") refreshIfDue();
    }, BACKGROUND_POLL_MS);

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", refreshIfDue);
      clearInterval(interval);
    };
  }, [router]);

  return null;
}
