import type { GoalCategory } from "@/generated/prisma/enums";

export type GoalCategoryMeta = {
  category: GoalCategory;
  label: string;
  illustration: string;
};

export const GOAL_CATEGORIES: GoalCategoryMeta[] = [
  { category: "HOME", label: "Hogar y muebles", illustration: "/assets/metas/01_hogar.png" },
  { category: "TRAVEL", label: "Viajes", illustration: "/assets/metas/02_viajes.png" },
  { category: "VEHICLE", label: "Vehículo", illustration: "/assets/metas/03_vehiculo.png" },
  { category: "TECH", label: "Tecnología", illustration: "/assets/metas/04_tecnologia.png" },
  {
    category: "EMERGENCY_FUND",
    label: "Fondo de emergencia",
    illustration: "/assets/metas/05_fondo_emergencia.png",
  },
  { category: "EXPERIENCES", label: "Experiencias", illustration: "/assets/metas/06_experiencias.png" },
  { category: "PROJECTS", label: "Proyectos en común", illustration: "/assets/metas/07_proyectos.png" },
  { category: "CUSTOM", label: "Personalizada", illustration: "/assets/metas/08_personalizada.png" },
];

export const GOAL_ACHIEVEMENTS_ILLUSTRATION = "/assets/metas/09_logros.png";

export function goalCategoryMeta(category: GoalCategory): GoalCategoryMeta | undefined {
  return GOAL_CATEGORIES.find((item) => item.category === category);
}
