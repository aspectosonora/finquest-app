import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth/session";
import { timed } from "@/lib/perf/timing";

/**
 * Envuelto en cache() de React: dentro de una misma petición (layout + page,
 * o varias llamadas en server actions encadenadas), la consulta a la base de
 * datos se hace una sola vez en lugar de repetirse por cada llamada.
 */
export const getCurrentUser = cache(async () => {
  const session = await timed("auth.readSession", () => readSession());
  if (!session) return null;

  const user = await timed("auth.dbUser", () =>
    db.user.findUnique({
      where: { id: session.userId },
      include: {
        team: {
          include: {
            members: { orderBy: { createdAt: "asc" } },
          },
        },
      },
    })
  );

  return user;
});

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
