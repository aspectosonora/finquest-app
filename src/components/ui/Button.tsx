import type { ButtonHTMLAttributes } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

const base =
  "inline-flex items-center justify-center gap-2 clip-br px-5 py-3 font-heading text-base font-extrabold italic uppercase tracking-wide transition-transform active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants = {
  primary: "bg-orange text-white hover:bg-orange-dark",
  electric: "bg-electric text-white hover:bg-electric-dark",
  outline: "bg-white text-ink border-2 border-ink",
  "outline-orange": "bg-white text-orange border-2 border-orange",
  ghost: "bg-transparent text-electric",
};

type Variant = keyof typeof variants;

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={cn(base, variants[variant], "w-full", className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={cn(base, variants[variant], "w-full", className)}>
      {children}
    </Link>
  );
}
