import clsx from "clsx";

export function ProgressBar({
  percent,
  color = "electric",
  trackClassName,
  className,
}: {
  percent: number;
  color?: "electric" | "orange" | "gold";
  trackClassName?: string;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const fillColor = {
    electric: "bg-electric",
    orange: "bg-orange",
    gold: "bg-gold",
  }[color];

  return (
    <div
      className={clsx("h-2.5 w-full overflow-hidden rounded-full bg-mist", trackClassName, className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={clsx("h-full rounded-full transition-[width] duration-500 ease-out", fillColor)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
