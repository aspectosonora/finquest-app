"use client";

import { useState } from "react";

type Players = {
  cinthya: { id: string; name: string };
  julio: { id: string; name: string };
};

const SELECT_TRANSITION_MS = 220;

export function PlayerSelectScreen({
  players,
  onSelect,
  onUseEmail,
}: {
  players: Players;
  onSelect: (player: "cinthya" | "julio") => void;
  onUseEmail: () => void;
}) {
  const [selecting, setSelecting] = useState<"cinthya" | "julio" | null>(null);

  function handleSelect(player: "cinthya" | "julio") {
    if (selecting) return;
    setSelecting(player);
    setTimeout(() => onSelect(player), SELECT_TRANSITION_MS);
  }

  function playerStyle(player: "cinthya" | "julio"): React.CSSProperties {
    if (!selecting) return {};
    const isSelected = selecting === player;
    return {
      transition: `transform ${SELECT_TRANSITION_MS}ms ease-out, opacity ${SELECT_TRANSITION_MS}ms ease-out`,
      transform: isSelected ? "translateY(-6px) scale(1.04)" : "scale(0.98)",
      opacity: isSelected ? 1 : 0.55,
    };
  }

  return (
    <div
      className="flex min-h-dvh items-start justify-center overflow-x-hidden"
      style={{ background: "#08154D" }}
    >
      <div
        className="relative w-full"
        style={{
          maxWidth: 480,
          aspectRatio: "863 / 1823",
          backgroundImage: "url(/assets/login/fondo_login.webp)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        {/* Logo */}
        <Box left={6.7} top={2.0} width={45} className="coop-in" style={{ animationDelay: "0ms" }}>
          <img src="/assets/login/logo_finquest_blanco.webp" alt="FinQuest" className="w-full" />
        </Box>

        {/* Lema */}
        <Box left={10.4} top={6.8} width={49} className="coop-in" style={{ animationDelay: "60ms" }}>
          <img src="/assets/login/lema.png" alt="Juntos subimos de nivel" className="w-full" />
        </Box>

        {/* Titular */}
        <Box left={5.2} top={11.2} width={92.1} className="coop-in-side" style={{ animationDelay: "100ms" }}>
          <img src="/assets/login/titulo_quien_juega_hoy.png" alt="¿Quién juega hoy?" className="w-full" />
        </Box>

        {/* Etiqueta modo cooperativo */}
        <Box left={4.3} top={28.2} width={51} className="coop-in" style={{ animationDelay: "150ms" }}>
          <div className="relative">
            <img src="/assets/login/etiqueta_cooperativo.svg" alt="" className="w-full" />
            <div className="absolute inset-0 flex items-center justify-center pl-[6%]">
              <img src="/assets/login/texto_modo_cooperativo.png" alt="Modo cooperativo" className="w-[78%]" />
            </div>
          </div>
        </Box>

        {/* Números decorativos: PNG originales provistos por el usuario */}
        <Box left={0.5} top={32.7} width={32} style={{ zIndex: 0 }} aria-hidden>
          <img src="/assets/login/numero_01.webp" alt="" className="block w-full" style={{ opacity: 0.42 }} />
        </Box>
        <Box left={65} top={30.8} width={34} style={{ zIndex: 0 }} aria-hidden>
          <img src="/assets/login/numero_02.webp" alt="" className="block w-full" style={{ opacity: 0.42 }} />
        </Box>

        {/* Avatares (también seleccionan al jugador) */}
        <Box
          left={4}
          top={39.5}
          width={50}
          className="coop-in-left"
          style={{ animationDelay: "200ms", ...playerStyle("cinthya") }}
        >
          <button
            type="button"
            onClick={() => handleSelect("cinthya")}
            aria-label={`Entrar como ${players.cinthya.name}`}
            className="block w-full active:scale-[0.97]"
          >
            <img src="/assets/login/avatar_cinthya_tight.webp" alt="" className="w-full" />
          </button>
        </Box>
        <Box
          left={47}
          top={43.5}
          width={52}
          className="coop-in-right"
          style={{ animationDelay: "220ms", ...playerStyle("julio") }}
        >
          <button
            type="button"
            onClick={() => handleSelect("julio")}
            aria-label={`Entrar como ${players.julio.name}`}
            className="block w-full active:scale-[0.97]"
          >
            <img src="/assets/login/avatar_julio_tight.webp" alt="" className="w-full" />
          </button>
        </Box>

        {/* Placas (botones) */}
        <Box
          left={0}
          top={68.1}
          width={53}
          className="coop-in"
          style={{ animationDelay: "260ms", ...playerStyle("cinthya") }}
        >
          <button
            type="button"
            onClick={() => handleSelect("cinthya")}
            aria-label={`Entrar como ${players.cinthya.name}`}
            className="relative block w-full active:scale-[0.97]"
          >
            <img src="/assets/login/placa_cinthya.svg" alt="" className="w-full" />
            <img
              src="/assets/login/texto_cinthya.png"
              alt={players.cinthya.name}
              className="absolute left-[14%] top-1/2 w-[60%] -translate-y-1/2"
            />
          </button>
        </Box>
        <Box
          left={44}
          top={68.1}
          width={56}
          className="coop-in"
          style={{ animationDelay: "280ms", ...playerStyle("julio") }}
        >
          <button
            type="button"
            onClick={() => handleSelect("julio")}
            aria-label={`Entrar como ${players.julio.name}`}
            className="relative block w-full active:scale-[0.97]"
          >
            <img src="/assets/login/placa_julio.svg" alt="" className="w-full" />
            <img
              src="/assets/login/texto_julio.png"
              alt={players.julio.name}
              className="absolute left-[30%] top-1/2 w-[60%] -translate-y-1/2"
            />
          </button>
        </Box>

        {/* Emblema central (decorativo): corazón original de FinQuest */}
        <Box left={40.62} top={69} width={14.77} style={{ pointerEvents: "none", zIndex: 10 }} aria-hidden>
          <img
            src="/assets/login/emblema_finquest_blanco_v2.png"
            alt=""
            className="block w-full"
            style={{ height: "auto", objectFit: "contain" }}
          />
        </Box>

        {/* Botón correo */}
        <Box left={5.7} top={82} width={88.6} className="coop-in" style={{ animationDelay: "320ms" }}>
          <button
            type="button"
            onClick={onUseEmail}
            className="block w-full rounded-[14px] border-2 border-white py-3 text-center font-sans text-base font-bold text-white"
            style={{ minHeight: 48 }}
          >
            Entrar con correo y contraseña
          </button>
        </Box>

        {/* Primera vez / enlaces */}
        <Box left={10} top={90} width={80} className="coop-in text-center" style={{ animationDelay: "340ms" }}>
          <p className="text-sm text-white/80">¿Primera vez?</p>
        </Box>
        <Box left={10} top={93.7} width={80} className="coop-in flex justify-center gap-3 text-center" style={{ animationDelay: "360ms" }}>
          <a href="/signup" className="font-bold text-white underline">
            Crear equipo
          </a>
          <span className="text-white/50">|</span>
          <a href="/unirse" className="font-bold text-white underline">
            Unirme con un código
          </a>
        </Box>
      </div>
    </div>
  );
}

function Box({
  left,
  top,
  width,
  className,
  style,
  children,
  ...rest
}: {
  left: number;
  top: number;
  width: number;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className ? `absolute ${className}` : "absolute"}
      style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
