"use client";

import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export function EmailFallback({ onBack }: { onBack?: () => void }) {
  return (
    <div
      className="flex min-h-dvh flex-col gap-6 px-6 pb-10"
      style={{ background: "#08154D", paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)" }}
    >
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          aria-label="Regresar"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white"
        >
          ←
        </button>
      )}

      <div className="flex flex-col items-center gap-1">
        <Image src="/assets/login/logo_finquest_blanco.png" alt="FinQuest" width={180} height={45} priority />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5">
        <h1 className="font-display text-2xl text-ink">Entrar</h1>
        <LoginForm />
      </div>

      <p className="text-center text-sm text-white/80">
        ¿Primera vez?{" "}
        <Link href="/signup" className="font-bold text-white underline">
          Crea su equipo
        </Link>{" "}
        o{" "}
        <Link href="/unirse" className="font-bold text-white underline">
          únete con un código
        </Link>
        .
      </p>
    </div>
  );
}
