"use client";

import { startTransition, useEffect, useState } from "react";
import Link from "next/link";
import { ActivityDetail } from "@/components/discover/activity-detail";
import { getCachedActivity } from "@/lib/activity-cache";
import type { ActivityCard } from "@/types/domain";

export function GooglePlaceDetailClient({
  id,
  isAuthenticated,
}: {
  id: string;
  isAuthenticated: boolean;
}) {
  const [activity, setActivity] = useState<ActivityCard | null | undefined>(undefined);

  useEffect(() => {
    const cached = getCachedActivity(id);
    startTransition(() => setActivity(cached));
  }, [id]);

  if (activity === undefined) return null;

  if (!activity) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="font-serif text-xl text-foreground">We lost track of that idea</p>
        <p className="text-sm text-muted-foreground">
          Head back to Discover and pick it again.
        </p>
        <Link
          href="/discover"
          className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Back to Discover
        </Link>
      </div>
    );
  }

  return <ActivityDetail activity={activity} isAuthenticated={isAuthenticated} />;
}
