import { NextRequest, NextResponse } from "next/server";
import type { DurationCategory } from "@/types/database";
import type { ActivityCard } from "@/types/domain";
import {
  NEARBY_TYPE_MAP,
  normalizeGooglePlace,
  radiusForDuration,
  resolveSearchTypes,
} from "@/lib/places";

export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "places_not_configured", results: [] },
      { status: 200 }
    );
  }

  const { searchParams } = request.nextUrl;
  const lat = Number(searchParams.get("lat"));
  const lng = Number(searchParams.get("lng"));
  const duration = searchParams.get("duration") as DurationCategory | null;
  const activityType = searchParams.get("type");
  const exclude = searchParams.get("exclude");
  const limit = Math.min(Number(searchParams.get("limit")) || 14, 14);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json(
      { error: "missing_coordinates", results: [] },
      { status: 400 }
    );
  }

  const includedTypes = activityType
    ? resolveSearchTypes(activityType) ?? [activityType]
    : Object.values(NEARBY_TYPE_MAP).flat();

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.primaryType,places.types,places.photos,places.editorialSummary",
      },
      body: JSON.stringify({
        includedTypes: includedTypes.slice(0, 10),
        maxResultCount: 14,
        rankPreference: "DISTANCE",
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: radiusForDuration(duration),
          },
        },
      }),
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "places_request_failed", results: [] },
        { status: 200 }
      );
    }

    const data = await res.json();
    const places = Array.isArray(data.places) ? data.places : [];

    const results = places
      .map((place: Parameters<typeof normalizeGooglePlace>[0]) =>
        normalizeGooglePlace(
          place,
          activityType ?? place.primaryType ?? "attraction",
          duration,
          { latitude: lat, longitude: lng }
        )
      )
      .filter((r: ActivityCard | null): r is ActivityCard => Boolean(r))
      .filter((r: ActivityCard) => r.externalPlaceId !== exclude)
      .slice(0, limit);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { error: "places_request_failed", results: [] },
      { status: 200 }
    );
  }
}
