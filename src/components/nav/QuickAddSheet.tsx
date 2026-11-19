"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const OPTIONS = [
  { tipo: "INGRESO_COBRADO", label: "Registrar ingreso cobrado", href: "/capturar?tipo=INGRESO_COBRADO" },
  { tipo: "INGRESO_ESPERADO", label: "Registrar ingreso esperado", href: "/equipo/ingresos/nuevo" },
  { tipo: "GASTO", label: "Registrar gasto", href: "/capturar?tipo=GASTO" },
  { tipo: "PAGO", label: "Registrar pago", href: "/capturar?tipo=PAGO" },
  { tipo: "ABONO_DEUDA", label: "Registrar abono a deuda", href: "/capturar?tipo=ABONO_DEUDA" },
  { tipo: "APORTACION_META", label: "Registrar aportación al ahorro", href: "/capturar?tipo=APORTACION_META" },
  { tipo: "APARTAR", label: "Apartar dinero", href: "/capturar?tipo=APARTAR" },
  { tipo: "LIBERAR_SUELDO", label: "Liberar sueldo personal", href: "/capturar?tipo=LIBERAR_SUELDO" },
] as const;

export function QuickAddFab() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Registrar movimiento"
        className="relative h-[52px] w-[52px] shrink-0 active:scale-95 transition-transform"
      >
        <Image src="/assets/navegacion/svg/boton_mas.svg" alt="" fill sizes="52px" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-ink/50"
            onClick={() => setOpen(false)}
          />
          <div className="safe-bottom relative w-full max-w-[440px] rounded-t-3xl bg-white p-4 pb-6 shadow-2xl">
            <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-mist" />
            <h2 className="mb-3 px-1 font-heading text-xl font-extrabold italic uppercase text-ink">
              ¿Qué quieren registrar?
            </h2>
            <ul className="flex flex-col gap-1">
              {OPTIONS.map((option) => (
                <li key={option.tipo}>
                  <Link
                    href={option.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 font-heading text-base font-bold text-ink hover:bg-mist-soft"
                  >
                    {option.label}
                    <span className="text-electric">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
