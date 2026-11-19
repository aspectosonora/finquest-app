import { Skeleton } from "@/components/ui/Skeleton";

export default function InicioLoading() {
  return (
    <div className="flex flex-col gap-5 pt-1">
      <Skeleton className="h-[129px] w-full rounded-2xl" />
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-[9px]">
        <Skeleton className="h-[112px] rounded-2xl" />
        <Skeleton className="h-[112px] rounded-2xl" />
      </div>
      <Skeleton className="h-16 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}
