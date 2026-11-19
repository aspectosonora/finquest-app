"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth/session";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { seedTeamDefaults } from "@/lib/finance/seed-team";

/**
 * FinQuest nació para Julio y Cinthya: si el nombre capturado coincide,
 * les asigna su avatar ilustrado de una vez en vez de dejarlos en iniciales.
 * Cualquier otro nombre se queda en iniciales hasta que elijan uno en Configuración.
 */
function detectAvatarKey(name: string): "JULIO" | "CINTHYA" | "CUSTOM" {
  const normalized = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  if (normalized === "julio") return "JULIO";
  if (normalized === "cinthya" || normalized === "cynthia" || normalized === "cinthia") return "CINTHYA";
  return "CUSTOM";
}

export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
} | null;

const emailSchema = z.string().trim().min(1, "Falta el correo").email("Correo inválido");
const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres");
const nameSchema = z.string().trim().min(1, "Falta el nombre").max(60);

const createTeamSchema = z.object({
  teamName: z.string().trim().min(1).max(60).optional().or(z.literal("")),
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export async function createTeamAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = createTeamSchema.safeParse({
    teamName: formData.get("teamName"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const { teamName, name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const team = await db.team.create({
    data: {
      name: teamName && teamName.length > 0 ? teamName : "Nuestro equipo",
      members: {
        create: {
          name,
          email,
          passwordHash,
          avatarKey: detectAvatarKey(name),
        },
      },
    },
    include: { members: true },
  });

  await seedTeamDefaults(team.id);

  const user = team.members[0];
  await createSession({ userId: user.id, teamId: team.id });
  redirect("/onboarding");
}

const joinTeamSchema = z.object({
  inviteCode: z.string().trim().min(1, "Falta el código de invitación"),
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export async function joinTeamAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = joinTeamSchema.safeParse({
    inviteCode: formData.get("inviteCode"),
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const { inviteCode, name, email, password } = parsed.data;

  const team = await db.team.findUnique({
    where: { inviteCode },
    include: { members: true },
  });

  if (!team) {
    return { error: "El código de invitación no es válido." };
  }
  if (team.inviteCodeExpiresAt && team.inviteCodeExpiresAt < new Date()) {
    return { error: "El código de invitación venció. Pide uno nuevo a tu pareja." };
  }
  if (team.members.length >= 2) {
    return { error: "Este equipo ya tiene dos integrantes." };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Ya existe una cuenta con ese correo." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      teamId: team.id,
      name,
      email,
      passwordHash,
      avatarKey: detectAvatarKey(name),
    },
  });

  await createSession({ userId: user.id, teamId: team.id });
  redirect("/onboarding");
}

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Falta la contraseña"),
});

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  }

  const { email, password } = parsed.data;
  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Correo o contraseña incorrectos." };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await createSession({ userId: user.id, teamId: user.teamId });
  redirect("/inicio");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

const PIN_MAX_ATTEMPTS = 5;
const PIN_LOCK_MINUTES = 5;
const pinSchema = z
  .string()
  .trim()
  .regex(/^\d{4,6}$/, "El código debe tener 4 a 6 dígitos");

const pinLoginSchema = z.object({
  userId: z.string().trim().min(1),
  pin: pinSchema,
});

export async function loginWithPinAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = pinLoginSchema.safeParse({
    userId: formData.get("userId"),
    pin: formData.get("pin"),
  });

  if (!parsed.success) {
    return { error: "Código inválido." };
  }

  const { userId, pin } = parsed.data;
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user || !user.pinCode) {
    return { error: "Código incorrecto." };
  }

  if (user.pinLockedUntil && user.pinLockedUntil > new Date()) {
    return { error: "Demasiados intentos. Intenta de nuevo en unos minutos." };
  }

  const valid = await bcrypt.compare(pin, user.pinCode);
  if (!valid) {
    const attempts = user.pinFailedAttempts + 1;
    const locked = attempts >= PIN_MAX_ATTEMPTS;
    await db.user.update({
      where: { id: userId },
      data: {
        pinFailedAttempts: locked ? 0 : attempts,
        pinLockedUntil: locked ? new Date(Date.now() + PIN_LOCK_MINUTES * 60 * 1000) : null,
      },
    });
    return {
      error: locked
        ? "Demasiados intentos. Intenta de nuevo en unos minutos."
        : "Código incorrecto.",
    };
  }

  await db.user.update({
    where: { id: userId },
    data: { pinFailedAttempts: 0, pinLockedUntil: null },
  });

  await createSession({ userId: user.id, teamId: user.teamId });
  redirect("/inicio");
}

const setPinSchema = z.object({ pin: pinSchema });

export async function setPinAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const currentUser = await requireCurrentUser();

  const parsed = setPinSchema.safeParse({ pin: formData.get("pin") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Código inválido." };
  }

  const pinCode = await bcrypt.hash(parsed.data.pin, 10);
  await db.user.update({
    where: { id: currentUser.id },
    data: { pinCode, pinFailedAttempts: 0, pinLockedUntil: null },
  });

  return { error: undefined };
}

export async function removePinAction() {
  const currentUser = await requireCurrentUser();
  await db.user.update({
    where: { id: currentUser.id },
    data: { pinCode: null, pinFailedAttempts: 0, pinLockedUntil: null },
  });
}
