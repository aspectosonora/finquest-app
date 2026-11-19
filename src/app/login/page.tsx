import type { Metadata } from "next";
import { db } from "@/lib/db";
import { CoopLogin } from "./CoopLogin";

export const dynamic = "force-dynamic";

// Fondo oscuro propio del login: barra de estado sólida oscura en vez de la
// "default" (clara) del resto de la app, para que combine y nunca quede
// transparente/difuminada sobre el logo.
export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
    title: "FinQuest",
  },
};

export default async function LoginPage() {
  const members = await db.user.findMany({
    where: { avatarKey: { in: ["JULIO", "CINTHYA"] } },
    select: { id: true, name: true, avatarKey: true, pinCode: true },
  });

  const julio = members.find((m) => m.avatarKey === "JULIO");
  const cinthya = members.find((m) => m.avatarKey === "CINTHYA");

  const players =
    julio?.pinCode && cinthya?.pinCode
      ? {
          cinthya: { id: cinthya.id, name: cinthya.name },
          julio: { id: julio.id, name: julio.name },
        }
      : null;

  return <CoopLogin players={players} />;
}
