import { cn } from "@/lib/cn";

/** Líneas diagonales decorativas, como las de los banners azules de referencia. */
export function DiagonalLines({ className, opacity = 0.35 }: { className?: string; opacity?: number }) {
  return (
    <svg
      aria-hidden
      className={cn("pointer-events-none absolute", className)}
      viewBox="0 0 160 160"
      preserveAspectRatio="none"
    >
      <g stroke="#fff" strokeOpacity={opacity} strokeWidth="3" strokeLinecap="round">
        <line x1="70" y1="-10" x2="170" y2="90" />
        <line x1="95" y1="-10" x2="195" y2="90" />
        <line x1="120" y1="-10" x2="220" y2="90" />
      </g>
    </svg>
  );
}
