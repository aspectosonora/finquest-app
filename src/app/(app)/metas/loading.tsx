import { Skeleton } from "@/components/ui/Skeleton";

export default function MetasLoading() {
  return (
    <div className="flex flex-col gap-5 pt-2">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-[7px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px]" />
        ))}
      </div>
    </div>
  );
}
