"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ExternalLink, MapPin } from "lucide-react";
import { useGeolocation } from "@/hooks/use-geolocation";
import { googleMapsUrl } from "@/lib/maps";
import { formatDistance } from "@/lib/geo";
import { resolveSearchTypes } from "@/lib/places";
import { Button } from "@/components/ui/button";
import type { ActivityCard, Coordinates } from "@/types/domain";

const MAP_WIDTH = 640;
const MAP_HEIGHT = 280;

export function SpotsNearby({ activity }: { activity: ActivityCard }) {
  const searchTypes = useMemo(
    () => resolveSearchTypes(activity.activityType),
    [activity.activityType]
  );
  const ownCoords: Coordinates | null =
    activity.latitude != null && activity.longitude != null
      ? { latitude: activity.latitude, longitude: activity.longitude }
      : null;

  const geo = useGeolocation();
  const center = ownCoords ?? geo.coords;

  const [spots, setSpots] = useState<ActivityCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (!center || !searchTypes) return;
    let cancelled = false;
    startTransition(() => setLoading(true));

    const params = new URLSearchParams({
      lat: String(center.latitude),
      lng: String(center.longitude),
      type: activity.activityType,
      duration: activity.durationCategory,
      limit: "5",
    });
    if (activity.externalPlaceId) params.set("exclude", activity.externalPlaceId);

    fetch(`/api/places/nearby?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        startTransition(() => {
          setSpots(data.results ?? []);
          setFetched(true);
        });
      })
      .catch(() => {
        if (cancelled) return;
        startTransition(() => {
          setSpots([]);
          setFetched(true);
        });
      })
      .finally(() => {
        if (!cancelled) startTransition(() => setLoading(false));
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.latitude, center?.longitude, searchTypes]);

  if (!searchTypes || activity.isAtHome) return null;

  // Nothing to search around yet — offer to use location (only needed
  // when this idea has no coordinates of its own).
  if (!center) {
    return (
      <div className="rounded-2xl border border-border bg-secondary/50 p-4">
        <p className="text-sm text-foreground">Want to see real spots nearby?</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{geo.error}</p>
        <Button
          size="sm"
          variant="secondary"
          className="mt-3 rounded-full"
          onClick={geo.request}
          disabled={geo.status === "loading"}
        >
          {geo.status === "loading" ? "Finding…" : "Use my location"}
        </Button>
      </div>
    );
  }

  if (fetched && spots.length === 0) return null;

  const mapUrl = (() => {
    const params = new URLSearchParams({
      center: `${center.latitude},${center.longitude}`,
      w: String(MAP_WIDTH),
      h: String(MAP_HEIGHT),
    });
    const points = spots
      .filter((s) => s.latitude != null && s.longitude != null)
      .map((s) => `${s.latitude},${s.longitude}`)
      .join(";");
    if (points) params.set("points", points);
    return `/api/places/staticmap?${params.toString()}`;
  })();

  return (
    <div className="space-y-3">
      <p className="font-medium text-foreground">Spots nearby</p>

      {loading && spots.length === 0 ? (
        <div className="aspect-2/1 w-full animate-pulse rounded-2xl bg-muted md:max-w-md" />
      ) : (
        <>
          {!mapFailed && (
            <div className="relative aspect-2/1 w-full overflow-hidden rounded-2xl bg-muted md:max-w-md">
              <Image
                src={mapUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 450px, 100vw"
                className="object-cover"
                unoptimized
                onError={() => setMapFailed(true)}
              />
            </div>
          )}

          <div className="space-y-2">
            {spots.map((spot) => (
              <a
                key={spot.id}
                href={googleMapsUrl(spot)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition-colors hover:bg-secondary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <MapPin className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {spot.placeName}
                  </p>
                  {spot.placeAddress && (
                    <p className="truncate text-xs text-muted-foreground">
                      {spot.placeAddress}
                    </p>
                  )}
                </div>
                {spot.distanceMiles != null && (
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDistance(spot.distanceMiles)}
                  </span>
                )}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <ExternalLink className="h-3.5 w-3.5" />
                </span>
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
