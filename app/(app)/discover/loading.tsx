import { Skeleton } from "@/components/ui/skeleton";
import { ActivityCardSkeleton } from "@/components/discover/activity-card-skeleton";

export default function DiscoverLoading() {
  return (
    <div className="space-y-6 pb-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
        <Skeleton className="h-24 rounded-3xl" />
      </div>
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <ActivityCardSkeleton />
        <ActivityCardSkeleton />
        <ActivityCardSkeleton />
        <ActivityCardSkeleton />
      </div>
    </div>
  );
}
