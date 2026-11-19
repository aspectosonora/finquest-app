"use client";

import { useActionState, useEffect, useRef } from "react";
import { celebrate } from "@/lib/effects/celebrate";
import type { CompleteChallengeResult } from "@/lib/finance/challenges-engine";

type Action = (
  prev: CompleteChallengeResult | null,
  formData: FormData
) => Promise<CompleteChallengeResult | null>;

export function CompleteChallengeButton({
  action,
  challengeId,
  label = "Marcar como cumplido",
  className = "text-xs font-bold text-electric underline",
}: {
  action: Action;
  challengeId: string;
  label?: string;
  className?: string;
}) {
  const [result, formAction, pending] = useActionState<CompleteChallengeResult | null, FormData>(
    action,
    null
  );
  const celebratedRef = useRef(false);

  useEffect(() => {
    if (result && !celebratedRef.current) {
      celebratedRef.current = true;
      if (result.leveledUp) {
        celebrate({ type: "levelup", level: result.newLevel });
      } else {
        celebrate({ type: "confetti" });
      }
    }
  }, [result]);

  return (
    <form action={formAction}>
      <input type="hidden" name="challengeId" value={challengeId} />
      <button type="submit" disabled={pending} className={className}>
        {pending ? "Guardando..." : label}
      </button>
    </form>
  );
}
