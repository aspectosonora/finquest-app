"use client";

/**
 * Instrumentación TEMPORAL de diagnóstico (rama perf/native-feel, no main):
 * mide el tiempo real entre el toque en el bottom nav y el momento en que
 * la nueva pantalla ya está pintada, en el propio dispositivo del usuario
 * (incluye red, JS, render de React e hidratación — no solo el servidor).
 * Se reporta a /api/perf-log, que lo imprime para leerlo en los logs de
 * Vercel. Se retira antes de fusionar a main.
 */
const tapMarks: Record<string, number> = {};

export function markTap(href: string) {
  try {
    const path = new URL(href, window.location.href).pathname;
    tapMarks[path] = performance.now();
  } catch {
    // no-op
  }
}

export function reportPaint(pathname: string) {
  const tapTime = tapMarks[pathname];
  if (tapTime == null) return;
  delete tapMarks[pathname];

  const deltaMs = Math.round(performance.now() - tapTime);
  const payload = JSON.stringify({
    pathname,
    deltaMs,
    ua: navigator.userAgent,
    t: Date.now(),
  });

  try {
    const blob = new Blob([payload], { type: "application/json" });
    if (!navigator.sendBeacon("/api/perf-log", blob)) {
      fetch("/api/perf-log", { method: "POST", body: payload, keepalive: true }).catch(() => {});
    }
  } catch {
    fetch("/api/perf-log", { method: "POST", body: payload, keepalive: true }).catch(() => {});
  }
}
