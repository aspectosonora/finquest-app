"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { loginWithPinAction, type AuthFormState } from "@/lib/auth/actions";

const PIN_LENGTH = 4;

const PLAYER_THEME = {
  cinthya: { color: "#153CFF", greeting: "¡HOLA, CINTHYA!" },
  julio: { color: "#FF591B", greeting: "¡HOLA, JULIO!" },
} as const;

export function PinEntryScreen({
  player,
  name,
  userId,
  avatarSrc,
  onBack,
  onForgot,
}: {
  player: "cinthya" | "julio";
  name: string;
  userId: string;
  avatarSrc: string;
  onBack: () => void;
  onForgot: () => void;
}) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(loginWithPinAction, null);
  const theme = PLAYER_THEME[player];

  useEffect(() => {
    if (state?.error) {
      setShake(true);
      setPin("");
      const t = setTimeout(() => setShake(false), 400);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    if (pin.length === PIN_LENGTH && !pending) {
      formRef.current?.requestSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin]);

  function press(digit: string) {
    if (pending) return;
    setPin((p) => (p.length < PIN_LENGTH ? p + digit : p));
  }

  function backspace() {
    if (pending) return;
    setPin((p) => p.slice(0, -1));
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col overflow-hidden"
      style={{ background: "#08154D" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: theme.color,
          clipPath: "polygon(0% 55%, 100% 28%, 100% 100%, 0% 100%)",
          opacity: 0.9,
        }}
      />

      <div
        className="relative z-10 flex items-center px-5"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)" }}
      >
        <button
          type="button"
          onClick={onBack}
          aria-label="Regresar"
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-white"
        >
          ←
        </button>
        <img src="/assets/login/logo_finquest_blanco.png" alt="FinQuest" className="ml-4 h-6 w-auto" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center px-6 pb-10 pt-4">
        <div style={{ width: "46%" }} className="mx-auto">
          <img src={avatarSrc} alt="" className="w-full" />
        </div>

        <h1 className="mt-4 text-center font-heading text-2xl font-extrabold italic uppercase text-white">
          {theme.greeting}
        </h1>
        <p className="mt-1 text-center text-sm text-white/70">Ingresa tu código para continuar</p>

        <form ref={formRef} action={formAction} className="contents">
          <input type="hidden" name="userId" value={userId} />
          <input type="hidden" name="pin" value={pin} />
        </form>

        <div className={`mt-6 flex gap-4 ${shake ? "coop-shake" : ""}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <span
              key={i}
              className="h-4 w-4 rounded-full border-2 border-white"
              style={{ backgroundColor: i < pin.length ? "#fff" : "transparent" }}
            />
          ))}
        </div>

        <p className="mt-3 min-h-[20px] text-center text-sm font-bold text-orange">
          {state?.error ?? (pending ? "Entrando..." : "")}
        </p>

        <div className="mt-4 grid w-full max-w-[330px] grid-cols-3 gap-[10px]">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <Key key={digit} onClick={() => press(digit)}>
              {digit}
            </Key>
          ))}
          <span />
          <Key onClick={() => press("0")}>0</Key>
          <Key onClick={backspace} aria-label="Borrar">
            ⌫
          </Key>
        </div>

        <button
          type="button"
          onClick={onForgot}
          className="mt-5 text-sm font-bold text-white/70 underline"
        >
          ¿Olvidaste tu código?
        </button>
      </div>
    </div>
  );
}

function Key({
  children,
  onClick,
  ...rest
}: { children: React.ReactNode; onClick: () => void } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center font-heading text-2xl font-bold text-white transition-transform active:scale-95"
      style={{ height: 64, borderRadius: 10, background: "rgba(255,255,255,0.12)" }}
      {...rest}
    >
      {children}
    </button>
  );
}
