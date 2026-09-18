"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ActivityCard } from "@/components/discover/activity-card";
import { cacheActivity } from "@/lib/activity-cache";
import { toggleFavorite } from "@/lib/actions/favorites";
import type { ActivityCard as ActivityCardType } from "@/types/domain";

export function FavoritesList({ initial }: { initial: ActivityCardType[] }) {
  const router = useRouter();
  const [activities, setActivities] = useState(initial);

  async function handleUnfavorite(activity: ActivityCardType) {
    setActivities((prev) => prev.filter((a) => a.id !== activity.id));
    const result = await toggleFavorite(activity);
    if ("error" in result) {
      setActivities((prev) => [...prev, activity]);
      toast.error("Couldn't remove that favourite — try again.");
    }
  }

  function handleOpen(activity: ActivityCardType) {
    if (activity.id.startsWith("google:")) cacheActivity(activity);
    router.push(`/discover/${encodeURIComponent(activity.id)}`);
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-16 text-center">
        <p className="font-serif text-xl text-foreground">Nothing saved yet.</p>
        <p className="max-w-xs text-sm text-muted-foreground">
          When something makes you think &ldquo;we should do this&rdquo;, save it here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      <AnimatePresence initial={false}>
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            favorited
            onOpen={() => handleOpen(activity)}
            onToggleFavorite={() => handleUnfavorite(activity)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
