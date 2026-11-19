export type ChallengeGroupKey = "INITIAL" | "WEEKLY" | "MONTHLY";

export type ChallengeTemplate = {
  key: string;
  title: string;
  description: string;
  group: ChallengeGroupKey;
  xp: number | null;
  icon: string;
};

function badgeIcon(id: string) {
  return `/assets/insignias/svg/${id}.svg`;
}

// Catálogo 1:1 con public/assets/insignias/manifest.json (14 insignias originales).
export const CHALLENGE_TEMPLATES: ChallengeTemplate[] = [
  {
    key: "inicial_primer_paso",
    title: "Primer paso",
    description: "Registrar todos sus ingresos.",
    group: "INITIAL",
    xp: 50,
    icon: badgeIcon("inicial_primer_paso"),
  },
  {
    key: "inicial_conoce_al_enemigo",
    title: "Conoce al enemigo",
    description: "Registrar todas sus deudas.",
    group: "INITIAL",
    xp: 100,
    icon: badgeIcon("inicial_conoce_al_enemigo"),
  },
  {
    key: "inicial_plan_de_batalla",
    title: "Plan de batalla",
    description: "Definir su presupuesto mensual.",
    group: "INITIAL",
    xp: 100,
    icon: badgeIcon("inicial_plan_de_batalla"),
  },
  {
    key: "inicial_nuestra_primera_meta",
    title: "Nuestra primera meta",
    description: "Crear una meta de ahorro en pareja.",
    group: "INITIAL",
    xp: 100,
    icon: badgeIcon("inicial_nuestra_primera_meta"),
  },
  {
    key: "inicial_primer_escudo",
    title: "Primer escudo",
    description: "Realizar la primera aportación al ahorro.",
    group: "INITIAL",
    xp: 150,
    icon: badgeIcon("inicial_primer_escudo"),
  },
  {
    key: "inicial_equipo_completo",
    title: "Equipo completo",
    description: "Ambos completan su configuración financiera.",
    group: "INITIAL",
    xp: 100,
    icon: badgeIcon("inicial_equipo_completo"),
  },
  {
    key: "semanal_dia_invicto",
    title: "Día invicto",
    description: "Un día sin gastos innecesarios.",
    group: "WEEKLY",
    xp: 50,
    icon: badgeIcon("semanal_dia_invicto"),
  },
  {
    key: "semanal_racha_campeones",
    title: "Racha de campeones",
    description: "Acumular tres días sin gastos innecesarios.",
    group: "WEEKLY",
    xp: 150,
    icon: badgeIcon("semanal_racha_campeones"),
  },
  {
    key: "semanal_cocinando_en_casa",
    title: "Cocinando en casa",
    description: "Evitar pedir comida tres veces en la semana.",
    group: "WEEKLY",
    xp: 100,
    icon: badgeIcon("semanal_cocinando_en_casa"),
  },
  {
    key: "semanal_resistir_tentacion",
    title: "Resistir la tentación",
    description: "Mantenerse dentro del presupuesto semanal.",
    group: "WEEKLY",
    xp: 150,
    icon: badgeIcon("semanal_resistir_tentacion"),
  },
  {
    key: "semanal_golpe_critico",
    title: "Golpe crítico",
    description: "Realizar un abono adicional a una deuda.",
    group: "WEEKLY",
    xp: 200,
    icon: badgeIcon("semanal_golpe_critico"),
  },
  {
    key: "semanal_cofre_tesoro",
    title: "Cofre del tesoro",
    description: "Cumplir el objetivo de ahorro semanal.",
    group: "WEEKLY",
    xp: 200,
    icon: badgeIcon("semanal_cofre_tesoro"),
  },
  {
    key: "semanal_contra_pronostico",
    title: "Contra todo pronóstico",
    description: "Terminar la semana sin compras impulsivas.",
    group: "WEEKLY",
    xp: 150,
    icon: badgeIcon("semanal_contra_pronostico"),
  },
  {
    key: "mensual_mision_navidad",
    title: "Misión Navidad",
    description: "Respetar el presupuesto de diciembre y cumplir su meta de ahorro mensual.",
    group: "MONTHLY",
    xp: null,
    icon: badgeIcon("mensual_mision_navidad"),
  },
];

export const INITIAL_CHALLENGE_TEMPLATES = CHALLENGE_TEMPLATES.filter(
  (template) => template.group === "INITIAL"
).map((template) => ({ key: template.key, title: template.title, description: template.description, xp: template.xp ?? 0 }));

// Umbrales de nivel (expandibles). El índice es el nivel; el valor es el XP mínimo requerido.
export const LEVEL_THRESHOLDS = [0, 500, 1000, 1500];

export function levelForXp(xp: number) {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? null;
  return { level, currentThreshold, nextThreshold };
}
