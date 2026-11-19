export type SplitShareInput = {
  userId: string;
  percent: number;
};

export type SplitShareResult = {
  userId: string;
  percent: number;
  amountCents: number;
};

/**
 * Reparte un monto en centavos enteros según porcentajes que deben sumar 100.
 * Todas las partes salvo la última se redondean hacia arriba al centavo;
 * la última absorbe la diferencia para que el total cuadre exacto
 * (así lo exige la referencia de cálculo de Metas).
 */
export function splitAmount(amountCents: number, shares: SplitShareInput[]): SplitShareResult[] {
  if (shares.length === 0) return [];

  const totalPercent = shares.reduce((sum, s) => sum + s.percent, 0);
  if (totalPercent !== 100) {
    throw new Error(`Los porcentajes de reparto deben sumar 100 (recibido ${totalPercent}).`);
  }

  const results: SplitShareResult[] = [];
  let assigned = 0;

  shares.forEach((share, index) => {
    const isLast = index === shares.length - 1;
    const amount = isLast ? amountCents - assigned : Math.ceil((amountCents * share.percent) / 100);
    assigned += amount;
    results.push({ userId: share.userId, percent: share.percent, amountCents: amount });
  });

  return results;
}

export function isValidSplit(shares: SplitShareInput[]): boolean {
  return shares.reduce((sum, s) => sum + s.percent, 0) === 100;
}
