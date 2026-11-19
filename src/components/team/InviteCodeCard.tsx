"use client";

import { useState } from "react";
import { regenerateInviteCodeAction } from "@/lib/finance/onboarding-actions";
import { Card } from "@/components/ui/Card";

export function InviteCodeCard({
  inviteCode,
  returnTo = "/onboarding",
}: {
  inviteCode: string;
  returnTo?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // portapapeles no disponible; el código sigue visible para copiarlo a mano
    }
  }

  return (
    <Card className="flex flex-col items-center gap-2 text-center">
      <p className="font-heading text-sm font-bold uppercase text-ink/60">Código de invitación</p>
      <p className="font-display text-base leading-snug tracking-wide text-electric break-all">
        {inviteCode}
      </p>
      <div className="flex gap-3">
        <button type="button" onClick={copy} className="font-heading font-bold text-electric underline">
          {copied ? "¡Copiado!" : "Copiar código"}
        </button>
        <form action={regenerateInviteCodeAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <button type="submit" className="font-heading font-bold text-ink/50 underline">
            Generar uno nuevo
          </button>
        </form>
      </div>
      <p className="text-xs text-ink/50">
        Compártelo solo con tu pareja: con él podrá unirse a su equipo desde /unirse.
      </p>
    </Card>
  );
}
