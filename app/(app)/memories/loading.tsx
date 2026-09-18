import { Skeleton } from "@/components/ui/skeleton";

export default function MemoriesLoading() {
  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2 overflow-hidden rounded-3xl border border-border/70">
          <Skeleton className="h-6 w-32 m-4 mb-0" />
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-2 p-5">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
