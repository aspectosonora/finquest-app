const formatter = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

const formatterWithCents = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

/** Formatea centavos enteros como moneda MXN sin decimales (p. ej. $12,500). */
export function formatCents(cents: number): string {
  return formatter.format(cents / 100);
}

/** Formatea centavos enteros como moneda MXN con decimales cuando aplica. */
export function formatCentsPrecise(cents: number): string {
  return formatterWithCents.format(cents / 100);
}

export function pesosToCents(pesos: number): number {
  return Math.round(pesos * 100);
}

export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}
