import type { DebtCategory } from "@/generated/prisma/enums";

export type DebtCategoryMeta = {
  category: DebtCategory;
  defaultName: string;
  illustration: string;
};

export const DEFAULT_DEBT_CATEGORIES: DebtCategoryMeta[] = [
  {
    category: "LIVERPOOL",
    defaultName: "Crédito Liverpool",
    illustration: "/assets/deudas/01_liverpool.png",
  },
  {
    category: "CAR_LOAN",
    defaultName: "Préstamo del carro",
    illustration: "/assets/deudas/02_carro.png",
  },
  {
    category: "CREDIT_CARD",
    defaultName: "Tarjeta de crédito",
    illustration: "/assets/deudas/03_tarjeta_credito.png",
  },
  {
    category: "PERSONAL_LOAN",
    defaultName: "Préstamo personal",
    illustration: "/assets/deudas/04_prestamo_personal.png",
  },
  {
    category: "INSTALLMENTS",
    defaultName: "Compras a plazos",
    illustration: "/assets/deudas/05_compras_a_plazos.png",
  },
  {
    category: "LATE_PAYMENTS",
    defaultName: "Pagos atrasados",
    illustration: "/assets/deudas/06_pagos_atrasados.png",
  },
];

export function debtCategoryMeta(category: DebtCategory): DebtCategoryMeta | undefined {
  return DEFAULT_DEBT_CATEGORIES.find((item) => item.category === category);
}
