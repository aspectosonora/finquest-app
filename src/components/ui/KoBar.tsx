import { cn } from "@/lib/cn";

const SEGMENTS = 10;

const KO_CLIP =
  "polygon(28% 0%, 72% 0%, 100% 28%, 100% 72%, 72% 100%, 28% 100%, 0% 72%, 0% 28%)";

export function KoBar({
  percent,
  status = "ACTIVE",
}: {
  percent: number;
  status?: "UNCONFIGURED" | "ACTIVE" | "DEFEATED";
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const defeated = status === "DEFEATED";
  const configured = status !== "UNCONFIGURED";

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "relative h-4 flex-1 overflow-hidden rounded-full",
          !configured ? "bg-[#C9CDEE]" : defeated ? "bg-electric/20" : "bg-orange/20"
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500 ease-out",
            !configured ? "bg-[#9AA1D9]" : defeated ? "bg-electric" : "bg-orange"
          )}
          style={{ width: `${clamped}%` }}
        />
        <div className="pointer-events-none absolute inset-0 flex">
          {Array.from({ length: SEGMENTS }).map((_, i) => (
            <span key={i} className="flex-1 border-r-2 border-white last:border-r-0" />
          ))}
        </div>
      </div>
      <span
        className={cn(
          "flex h-6 w-10 shrink-0 items-center justify-center font-heading text-[11px] font-black italic text-white"
        )}
        style={{
          clipPath: KO_CLIP,
          backgroundColor: !configured ? "#9AA1D9" : defeated ? "var(--color-electric)" : "var(--color-orange)",
        }}
      >
        KO
      </span>
    </div>
  );
}
