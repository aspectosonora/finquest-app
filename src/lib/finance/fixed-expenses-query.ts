import "server-only";
import { db } from "@/lib/db";

export async function getFixedExpenseTypes(teamId: string) {
  return db.fixedExpenseType.findMany({
    where: { teamId },
    include: { responsibleUser: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function getPendingSettlements(teamId: string) {
  return db.movement.findMany({
    where: { teamId, settlementStatus: "PENDING" },
    include: { settlementPayerUser: true, settlementOwerUser: true },
    orderBy: { occurredAt: "desc" },
  });
}

/**
 * A quién le toca pagar esta vez: se alterna automáticamente con la última
 * persona que lo pagó (si Julio pagó la última vez, ahora le toca a
 * Cinthya), para no tener que decidirlo cada vez a mano. `fallbackUserId`
 * (el "responsable inicial" configurado) solo se usa la primera vez.
 */
export async function getCurrentTurnUserId(
  fixedExpenseTypeId: string,
  fallbackUserId: string,
  memberIds: string[]
): Promise<string> {
  const last = await db.movement.findFirst({
    where: { relatedFixedExpenseTypeId: fixedExpenseTypeId },
    orderBy: { occurredAt: "desc" },
    select: { userId: true },
  });
  if (!last?.userId) return fallbackUserId;
  return memberIds.find((id) => id !== last.userId) ?? fallbackUserId;
}

export async function getFixedExpenseTypesWithTurn(teamId: string, memberIds: string[]) {
  const types = await getFixedExpenseTypes(teamId);
  return Promise.all(
    types.map(async (t) => ({
      ...t,
      currentTurnUserId: await getCurrentTurnUserId(t.id, t.responsibleUserId, memberIds),
    }))
  );
}
