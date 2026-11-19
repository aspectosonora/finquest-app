import type { ReactNode } from "react";

export function SectionHeading({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-heading text-2xl font-extrabold italic uppercase tracking-wide text-ink">
        <span className="inline-block h-6 w-2 skew-chip bg-orange" aria-hidden />
        {children}
      </h2>
      {action}
    </div>
  );
}
