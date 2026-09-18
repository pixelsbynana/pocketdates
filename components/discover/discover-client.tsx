"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Greeting } from "@/components/discover/greeting";
import { DurationSelector } from "@/components/discover/duration-selector";
import { LocationSelector } from "@/components/discover/location-selector";
import { SurpriseButton } from "@/components/discover/surprise-button";
import { ActivityCard } from "@/components/discover/activity-card";
import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog";
import {
  applyFilters,
  rankActivities,
  surpriseActivity,
  type DiscoverFilters,
  type RecommendationContext,
} from "@/lib/recommendations";
import { toggleFavorite } from "@/lib/actions/favorites";
import { getPendingAction, clearPendingAction, type PendingAction } from "@/lib/pending-action";
import type { ActivityCard as ActivityCardType } from "@/types/domain";
import type { DurationCategory } from "@/types/database";

interface DiscoverClientProps {
  seedActivities: ActivityCardType[];
  recommendationContext: Omit<RecommendationContext, "coords">;
  firstName: string | null;
  isAuthenticated: boolean;
  isDemo: boolean;
  initialFavoritedIds: string[];
}

export function DiscoverClient({
  seedActivities,
  recommendationContext,
  firstName,
  isAuthenticated,
  isDemo,
  initialFavoritedIds,
}: DiscoverClientProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<DiscoverFilters>({
    duration: null,
    location: "any",
  });
  const [favoritedIds, setFavoritedIds] = useState(new Set(initialFavoritedIds));
  const [authOpen, setAuthOpen] = useState(false);
  const [authPendingAction, setAuthPendingAction] = useState<PendingAction | undefined>();

  async function handleToggleFavorite(activity: ActivityCardType) {
    if (!isAuthenticated) {
      setAuthPendingAction({ type: "favorite", activity });
      setAuthOpen(true);
      return;
    }
    const wasFavorited = favoritedIds.has(activity.id);
    setFavoritedIds((prev) => {
      const next = new Set(prev);
      if (wasFavorited) next.delete(activity.id);
      else next.add(activity.id);
      return next;
    });
    const result = await toggleFavorite(activity);
    if ("error" in result) {
      setFavoritedIds((prev) => {
        const next = new Set(prev);
        if (wasFavorited) next.add(activity.id);
        else next.delete(activity.id);
        return next;
      });
      toast.error("Couldn't save that favourite — try again in a moment.");
    } else {
      toast.success(result.favorited ? "Saved to favourites" : "Removed from favourites");
    }
  }

  // Resume an action (e.g. favouriting) that was interrupted by a sign-up.
  useEffect(() => {
    if (!isAuthenticated) return;
    const pending = getPendingAction();
    if (pending?.type === "favorite") {
      clearPendingAction();
      startTransition(() => {
        handleToggleFavorite(pending.activity);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const context: RecommendationContext = {
    ...recommendationContext,
    coords: null,
    favoritedActivityIds: favoritedIds,
  };

  const results = useMemo(
    () => rankActivities(applyFilters(seedActivities, filters), context),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seedActivities, filters, context.recentActivityTypes, context.recentActivityIds, favoritedIds]
  );

  function handleOpen(activity: ActivityCardType) {
    router.push(`/discover/${encodeURIComponent(activity.id)}`);
  }

  function handleSurprise(): ActivityCardType | null {
    return surpriseActivity(applyFilters(seedActivities, filters), context);
  }

  return (
    <div className="space-y-6 pb-4">
      {isDemo && (
        <div className="rounded-2xl border border-dashed border-primary/40 bg-secondary/50 px-4 py-2.5 text-center text-xs font-medium text-primary">
          You&apos;re browsing a demo —{" "}
          <Link href="/signup" className="underline">
            sign up
          </Link>{" "}
          to save real memories together.
        </div>
      )}

      <Greeting firstName={firstName} />

      <DurationSelector
        value={filters.duration}
        onChange={(value: DurationCategory | null) =>
          setFilters((f) => ({ ...f, duration: value }))
        }
      />

      <LocationSelector
        value={filters.location}
        onChange={(value) => setFilters((f) => ({ ...f, location: value }))}
      />

      <SurpriseButton onSurprise={handleSurprise} onView={handleOpen} />

      <div>
        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border py-16 text-center">
            <p className="font-serif text-xl text-foreground">Nothing quite matches yet</p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Try a different duration or clearing a filter — there&apos;s more to find.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {results.map((activity) => (
                <ActivityCard
                  key={activity.id}
                  activity={activity}
                  onOpen={() => handleOpen(activity)}
                  onToggleFavorite={() => handleToggleFavorite(activity)}
                  favorited={favoritedIds.has(activity.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AuthRequiredDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        pendingAction={authPendingAction}
      />
    </div>
  );
}
