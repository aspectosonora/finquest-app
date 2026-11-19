import { Skeleton } from "@/components/ui/Skeleton";

export default function EquipoLoading() {
  return (
    <div className="flex flex-col gap-5 pt-2">
      <Skeleton className="h-11 w-52" />
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-44 w-full rounded-2xl" />
    </div>
  );
}
