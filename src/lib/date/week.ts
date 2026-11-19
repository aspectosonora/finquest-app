const TIMEZONE = "America/Hermosillo";

function todayInTimezone(date: Date): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIMEZONE,
  }).formatToParts(date);
  const year = Number(parts.find((p) => p.type === "year")?.value);
  const month = Number(parts.find((p) => p.type === "month")?.value);
  const day = Number(parts.find((p) => p.type === "day")?.value);
  // Mediodía UTC evita saltos de día por husos horarios al operar con esta fecha.
  return new Date(Date.UTC(year, month - 1, day, 12));
}

/** Lunes 00:00 y domingo 23:59:59 de la semana que contiene `date`, en zona del equipo. */
export function currentWeekRange(date: Date = new Date()) {
  const today = todayInTimezone(date);
  const weekday = today.getUTCDay(); // 0=domingo..6=sábado
  const diffToMonday = weekday === 0 ? 6 : weekday - 1;

  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - diffToMonday);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

/** Clave estable de semana ISO-ish, p. ej. "2026-W47", para evitar duplicar retos. */
export function weekKey(date: Date = new Date()): string {
  const { start } = currentWeekRange(date);
  const year = start.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const days = Math.floor((start.getTime() - jan1.getTime()) / 86400000);
  const week = Math.ceil((days + jan1.getUTCDay() + 1) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}
