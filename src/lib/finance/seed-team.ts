import "server-only";

import { db } from "@/lib/db";
import { DEFAULT_DEBT_CATEGORIES } from "@/lib/constants/debts";
import { INITIAL_CHALLENGE_TEMPLATES } from "@/lib/constants/challenges";

/**
 * Crea el contenido base de un equipo nuevo: categorías de deuda
 * disponibles para configurar (sin montos) y los retos iniciales.
 * No crea ingresos, saldos, metas ni reparto: eso lo capturan
 * Julio y Cinthya juntos en el asistente de configuración.
 */
export async function seedTeamDefaults(teamId: string) {
  await db.$transaction([
    db.debt.createMany({
      data: DEFAULT_DEBT_CATEGORIES.map((category, index) => ({
        teamId,
        category: category.category,
        name: category.defaultName,
        status: "UNCONFIGURED" as const,
        sortOrder: index,
      })),
    }),
    db.challenge.createMany({
      data: INITIAL_CHALLENGE_TEMPLATES.map((template) => ({
        teamId,
        templateKey: template.key,
        title: template.title,
        description: template.description,
        group: "INITIAL" as const,
        xpReward: template.xp,
        targetCount: 1,
        status: "ACTIVE" as const,
      })),
    }),
  ]);
}
