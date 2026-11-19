import "server-only";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { readSession } from "@/lib/auth/session";

export async function getCurrentUser() {
  const session = await readSession();
  if (!session) return null;

  const user = await db.user.findUnique({
    where: { id: session.userId },
    include: {
      team: {
        include: {
          members: { orderBy: { createdAt: "asc" } },
        },
      },
    },
  });

  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
