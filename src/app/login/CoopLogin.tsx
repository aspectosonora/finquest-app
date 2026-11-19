"use client";

import { useState } from "react";
import { EmailFallback } from "./EmailFallback";
import { PlayerSelectScreen } from "./PlayerSelectScreen";
import { PinEntryScreen } from "./PinEntryScreen";

type Players = {
  cinthya: { id: string; name: string };
  julio: { id: string; name: string };
} | null;

const AVATAR_SRC = {
  cinthya: "/assets/login/avatar_cinthya_tight.webp",
  julio: "/assets/login/avatar_julio_tight.webp",
} as const;

export function CoopLogin({ players }: { players: Players }) {
  const [step, setStep] = useState<"select" | "pin" | "email">(players ? "select" : "email");
  const [selected, setSelected] = useState<"cinthya" | "julio" | null>(null);

  if (step === "email" || !players) {
    return <EmailFallback onBack={players ? () => setStep("select") : undefined} />;
  }

  if (step === "pin" && selected) {
    const player = players[selected];
    return (
      <PinEntryScreen
        player={selected}
        name={player.name}
        userId={player.id}
        avatarSrc={AVATAR_SRC[selected]}
        onBack={() => {
          setSelected(null);
          setStep("select");
        }}
        onForgot={() => setStep("email")}
      />
    );
  }

  return (
    <PlayerSelectScreen
      players={players}
      onSelect={(player) => {
        setSelected(player);
        setStep("pin");
      }}
      onUseEmail={() => setStep("email")}
    />
  );
}
