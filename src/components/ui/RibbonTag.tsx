import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function RibbonTag({
  children,
  color = "orange",
  className,
}: {
  children: ReactNode;
  color?: "orange" | "electric";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "clip-ribbon inline-block px-3.5 py-1 font-heading text-xs font-extrabold uppercase italic tracking-wide text-white",
        color === "orange" ? "bg-orange" : "bg-electric",
        className
      )}
    >
      {children}
    </span>
  );
}
