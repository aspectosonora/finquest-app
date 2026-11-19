import { Skeleton } from "@/components/ui/Skeleton";

export default function RetosLoading() {
  return (
    <div className="flex flex-col gap-5 pt-1">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-44 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}
