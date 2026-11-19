import { Skeleton } from "@/components/ui/Skeleton";

export default function DeudasLoading() {
  return (
    <div className="flex flex-col pt-1">
      <div className="-mx-4 bg-electric px-[14px] pb-7 pt-4">
        <Skeleton className="h-9 w-[198px] bg-white/20" />
        <Skeleton className="mt-2 h-4 w-40 bg-white/20" />
      </div>
      <div className="-mx-4 flex flex-col gap-[10px] bg-electric px-[6px] pb-7 pt-[10px]">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[158px] rounded-none bg-white/90" />
        ))}
      </div>
    </div>
  );
}
