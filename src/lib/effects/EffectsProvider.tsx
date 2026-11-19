"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "finquest_effects_enabled";

type EffectsContextValue = {
  enabled: boolean;
  setEnabled: (value: boolean) => void;
};

const EffectsContext = createContext<EffectsContextValue>({
  enabled: true,
  setEnabled: () => {},
});

export function EffectsProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabledState] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setEnabledState(stored === "1");
    } catch {
      // localStorage no disponible (modo privado, etc.): usar el valor por defecto.
    }
  }, []);

  // Pausar animaciones CSS cuando la pestaña/app pasa a segundo plano.
  useEffect(() => {
    function sync() {
      document.documentElement.toggleAttribute("data-app-hidden", document.hidden);
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  function setEnabled(value: boolean) {
    setEnabledState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      // ignorar si no se puede persistir
    }
  }

  return <EffectsContext.Provider value={{ enabled, setEnabled }}>{children}</EffectsContext.Provider>;
}

/** true solo si el usuario tiene los efectos activados y su sistema no pide movimiento reducido. */
export function useEffectsEnabled() {
  const { enabled } = useContext(EffectsContext);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return enabled && !reducedMotion;
}

export function useEffectsToggle() {
  return useContext(EffectsContext);
}
