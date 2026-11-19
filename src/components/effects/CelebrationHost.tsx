"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { onCelebrate, type CelebrationPayload } from "@/lib/effects/celebrate";
import { useEffectsEnabled } from "@/lib/effects/EffectsProvider";

const CONFETTI_COLORS = ["#1746F5", "#FF5B24", "#FFFFFF"];
const AUTO_DISMISS_MS: Record<CelebrationPayload["type"], number> = {
  confetti: 1200,
  ko: 1800,
  levelup: 2400,
  goal: 2600,
  chest: 2200,
};

export function CelebrationHost() {
  const [active, setActive] = useState<CelebrationPayload | null>(null);
  const enabled = useEffectsEnabled();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return onCelebrate((payload) => {
      if (!enabled) return;
      setActive(payload);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setActive(null), AUTO_DISMISS_MS[payload.type]);
    });
  }, [enabled]);

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[200] mx-auto flex max-w-[440px] items-center justify-center overflow-hidden">
      {active.type === "confetti" && <ConfettiBurst />}
      {active.type === "ko" && <KoStamp />}
      {active.type === "levelup" && <LevelUpBanner level={active.level} />}
      {active.type === "goal" && <GoalBanner name={active.name} />}
      {active.type === "chest" && <ChestPop />}
    </div>
  );
}

function ConfettiBurst() {
  const pieces = useRandomConfetti(28);
  return (
    <div className="absolute inset-0">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="fx-confetti-piece absolute top-0 block rounded-[2px]"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.4,
              background: p.color,
              "--fx-x": "0px",
              "--fx-x-end": `${p.drift}px`,
              "--fx-y-end": `${p.fall}px`,
              "--fx-rotate": `${p.rotate}deg`,
              "--fx-duration": `${p.duration}ms`,
              animationDelay: `${p.delay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function useRandomConfetti(count: number) {
  const [pieces] = useState(() =>
    Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      drift: (Math.random() - 0.5) * 160,
      fall: 320 + Math.random() * 160,
      rotate: 360 + Math.random() * 360,
      duration: 850 + Math.random() * 450,
      delay: Math.random() * 150,
    }))
  );
  return pieces;
}

function KoStamp() {
  return (
    <div className="fx-pop-in absolute inset-0 flex items-center justify-center bg-ink/40">
      <div
        className="fx-stamp-in flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange bg-electric font-heading text-3xl font-black italic text-white shadow-xl"
        style={{ transform: "rotate(-8deg)" }}
      >
        ¡KO!
      </div>
    </div>
  );
}

function LevelUpBanner({ level }: { level: number }) {
  return (
    <div className="fx-banner-in absolute left-4 right-4 top-16 flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-xl">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange font-heading text-sm font-black italic">
        NV{level}
      </span>
      <div>
        <p className="font-heading text-lg font-black italic uppercase leading-tight">¡Nivel {level}!</p>
        <p className="text-xs text-white/70">Suben de nivel juntos</p>
      </div>
    </div>
  );
}

function GoalBanner({ name }: { name?: string }) {
  return (
    <div className="fx-banner-in absolute left-4 right-4 top-16 flex items-center gap-3 rounded-2xl bg-electric px-4 py-3 text-white shadow-xl">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white font-heading text-lg font-black text-electric">
        ✓
      </span>
      <div className="min-w-0">
        <p className="font-heading text-lg font-black italic uppercase leading-tight">¡Meta cumplida!</p>
        {name && <p className="truncate text-xs text-white/80">{name}</p>}
      </div>
    </div>
  );
}

function ChestPop() {
  return (
    <div className="fx-pop-in absolute inset-0 flex items-center justify-center bg-ink/30">
      <div className="fx-stamp-in flex flex-col items-center gap-2">
        <Image
          src="/assets/insignias/svg/semanal_cofre_tesoro.svg"
          alt=""
          width={96}
          height={96}
        />
        <p className="rounded-full bg-white px-4 py-1.5 font-heading text-sm font-black italic uppercase text-ink shadow-lg">
          ¡Recompensa!
        </p>
      </div>
    </div>
  );
}
