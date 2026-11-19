"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { PinLoginPicker } from "./PinLoginPicker";

type Profile = { id: string; name: string; avatarKey: string; avatarUrl: string | null };

export function LoginClient({ pinUsers }: { pinUsers: Profile[] }) {
  const [mode, setMode] = useState<"pin" | "email">(pinUsers.length > 0 ? "pin" : "email");

  if (mode === "pin") {
    return <PinLoginPicker users={pinUsers} onUseEmail={() => setMode("email")} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <LoginForm />
      {pinUsers.length > 0 && (
        <button
          type="button"
          onClick={() => setMode("pin")}
          className="text-center text-sm font-bold text-electric underline"
        >
          Entrar con código
        </button>
      )}
    </div>
  );
}
