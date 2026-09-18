"use client";

import { startTransition, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Heart, Home, MapPin, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AuthRequiredDialog } from "@/components/auth/auth-required-dialog";
import { SpotsNearby } from "@/components/discover/spots-nearby";
import { googleMapsUrl } from "@/lib/maps";
import { formatDistance } from "@/lib/geo";
import { toggleFavorite } from "@/lib/actions/favorites";
import { getPendingAction, clearPendingAction, type PendingAction } from "@/lib/pending-action";
import type { ActivityCard } from "@/types/domain";

const DURATION_LABEL: Record<ActivityCard["durationCategory"], string> = {
  under_30: "Under 30 minutes",
  "1_2_hours": "1–2 hours",
  "3_plus_hours": "3+ hours",
};

interface ActivityDetailProps {
  activity: ActivityCard;
  isAuthenticated: boolean;
  initiallyFavorited?: boolean;
}

export function ActivityDetail({
  activity,
  isAuthenticated,
  initiallyFavorited = false,
}: ActivityDetailProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initiallyFavorited);
  const [authOpen, setAuthOpen] = useState(false);
  const [authPendingAction, setAuthPendingAction] = useState<PendingAction>({
    type: "favorite",
    activity,
  });
  const hasLocation = Boolean(activity.placeName || activity.placeAddress);

  // Resume whatever the user was trying to do before signing up.
  useEffect(() => {
    if (!isAuthenticated) return;
    const pending = getPendingAction();
    if (!pending || pending.activity.id !== activity.id) return;
    clearPendingAction();

    if (pending.type === "save_memory") {
      router.push(`/memories/new?activityId=${encodeURIComponent(activity.id)}`);
    } else if (pending.type === "favorite") {
      startTransition(() => {
        handleFavorite();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function handleFavorite() {
    if (!isAuthenticated) {
      setAuthPendingAction({ type: "favorite", activity });
      setAuthOpen(true);
      return;
    }
    setFavorited((f) => !f);
    const result = await toggleFavorite(activity);
    if ("error" in result) {
      setFavorited((f) => !f);
      toast.error("Couldn't save that favourite — try again in a moment.");
    } else {
      toast.success(result.favorited ? "Saved to favourites" : "Removed from favourites");
    }
  }

  function handleSaveDate() {
    if (!isAuthenticated) {
      setAuthPendingAction({ type: "save_memory", activity });
      setAuthOpen(true);
      return;
    }
    router.push(`/memories/new?activityId=${encodeURIComponent(activity.id)}`);
  }

  return (
    <div className="-mt-page pb-10">
      <div className="relative -mx-4 aspect-4/3 w-[calc(100%+2rem)] overflow-hidden bg-linear-to-br from-beige to-rose/25 sm:mx-0 sm:w-full sm:rounded-3xl md:aspect-16/9">
        {activity.imageUrl ? (
          <Image
            src={activity.imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-9xl">
            {activity.emoji ?? "🍂"}
          </div>
        )}
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-foreground backdrop-blur"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={handleFavorite}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from favourites" : "Save to favourites"}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card/90 text-rose backdrop-blur transition-transform active:scale-90"
        >
          <Heart className="h-5 w-5" fill={favorited ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="space-y-5 pt-5">
        <div>
          <h1 className="font-serif text-3xl leading-tight text-foreground">
            {activity.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> {DURATION_LABEL[activity.durationCategory]}
            </span>
            {activity.isAtHome ? (
              <span className="inline-flex items-center gap-1.5">
                <Home className="h-4 w-4" /> At home
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {activity.distanceMiles != null
                  ? formatDistance(activity.distanceMiles)
                  : "Nearby"}
              </span>
            )}
          </div>
        </div>

        <p className="text-base leading-relaxed text-foreground/90">
          {activity.description}
        </p>

        {hasLocation && (
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-sm font-medium text-foreground">{activity.placeName}</p>
            {activity.placeAddress && (
              <p className="mt-0.5 text-sm text-muted-foreground">{activity.placeAddress}</p>
            )}
            <a
              href={googleMapsUrl(activity)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              Open in Google Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        )}

        <SpotsNearby activity={activity} />

        <Button
          type="button"
          size="lg"
          className="w-full rounded-full"
          onClick={handleSaveDate}
        >
          Let&apos;s do this ❤️
        </Button>
      </div>

      <AuthRequiredDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        pendingAction={authPendingAction}
        title={
          authPendingAction.type === "save_memory"
            ? "Save this as a memory"
            : undefined
        }
        description={
          authPendingAction.type === "save_memory"
            ? "Create a free account to turn this into a memory you can look back on together."
            : undefined
        }
      />
    </div>
  );
}
