import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-mist bg-white/60 px-4 py-6 text-center">
      {icon && <div className="text-ink/30">{icon}</div>}
      <p className="font-heading text-lg font-bold italic uppercase text-ink/70">{title}</p>
      {description && <p className="text-sm text-ink/50">{description}</p>}
      {action}
    </div>
  );
}
