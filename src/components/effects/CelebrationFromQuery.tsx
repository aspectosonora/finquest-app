"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { celebrate } from "@/lib/effects/celebrate";

/**
 * Lee banderas de celebración en la URL (puestas por un redirect del
 * servidor justo después de confirmar que la operación se guardó),
 * dispara la celebración UNA SOLA VEZ y limpia la URL para que recargar
 * la pantalla no la repita.
 */
export function CelebrationFromQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;

    if (searchParams.has("debt_defeated")) {
      firedRef.current = true;
      celebrate({ type: "ko" });
    } else if (searchParams.has("payment")) {
      firedRef.current = true;
      celebrate({ type: "confetti" });
    } else if (searchParams.has("goal_completed")) {
      firedRef.current = true;
      celebrate({ type: "goal", name: searchParams.get("goal_completed") ?? undefined });
    } else {
      return;
    }

    const url = new URL(window.location.href);
    url.search = "";
    router.replace(`${pathname}${url.search}`, { scroll: false });
  }, [searchParams, router, pathname]);

  return null;
}
