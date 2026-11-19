const TIMEZONE = "America/Hermosillo";

/** Mes actual en español, en mayúsculas (p. ej. "DICIEMBRE"), calculado en vivo. */
export function currentMonthLabel(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat("es-MX", {
    month: "long",
    timeZone: TIMEZONE,
  }).format(date);
  return formatted.toUpperCase();
}

/** Clave de mes estable para agrupar registros, p. ej. "2026-12". */
export function monthKey(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    timeZone: TIMEZONE,
  }).formatToParts(date);
  const year = parts.find((p) => p.type === "year")?.value ?? "0000";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  return `${year}-${month}`;
}

export function weekdayShort(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", { weekday: "short", timeZone: TIMEZONE })
    .format(date)
    .replace(".", "")
    .toUpperCase();
}
