import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("fx-shimmer rounded-xl bg-mist", className)} />;
}
