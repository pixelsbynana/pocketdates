import type { DateStyle, DurationCategory, IndoorOutdoor, Interest } from "@/types/database";
import type { ActivityCard, Coordinates } from "@/types/domain";
import { distanceInMiles } from "@/lib/geo";

/** Maps our internal activity_type vocabulary to Google Places (New) types. */
export const NEARBY_TYPE_MAP: Record<string, string[]> = {
  coffee: ["cafe", "coffee_shop"],
  bubble_tea: ["cafe"],
  bookshop: ["book_store"],
  park: ["park"],
  museum: ["museum"],
  cinema: ["movie_theater"],
  dessert: ["bakery", "dessert_shop"],
  arcade: ["amusement_center"],
  restaurant: ["restaurant"],
  attraction: ["tourist_attraction"],
  exploring: ["tourist_attraction"],
  photography: ["tourist_attraction", "park"],
  nature: ["park", "hiking_area"],
};

/**
 * Resolves an activity's search category to Google Places (New) included
 * types, for finding "spots nearby" relevant to that specific idea.
 * Falls back to treating the activity_type itself as a raw Google type
 * (real places sourced without a category filter store their Google
 * `primaryType` directly, e.g. "cafe"), and returns null when there's no
 * sensible place category (at-home-only activity types).
 */
export function resolveSearchTypes(activityType: string): string[] | null {
  if (NEARBY_TYPE_MAP[activityType]) return NEARBY_TYPE_MAP[activityType];
  if (Object.values(NEARBY_TYPE_MAP).some((types) => types.includes(activityType))) {
    return [activityType];
  }
  return null;
}

const OUTDOOR_TYPES = new Set(["park", "tourist_attraction", "nature", "hiking_area"]);

const TYPE_TAGS: Record<
  string,
  { interests: Interest[]; dateStyles: DateStyle[] }
> = {
  coffee: { interests: ["coffee"], dateStyles: ["cozy", "simple"] },
  bubble_tea: { interests: ["food"], dateStyles: ["cozy", "spontaneous"] },
  bookshop: { interests: ["books"], dateStyles: ["cozy", "simple"] },
  park: { interests: ["nature"], dateStyles: ["outdoors", "simple"] },
  museum: { interests: ["museums"], dateStyles: ["creative", "simple"] },
  cinema: { interests: ["films"], dateStyles: ["simple", "romantic"] },
  dessert: { interests: ["food"], dateStyles: ["foodie", "simple"] },
  arcade: { interests: ["gaming"], dateStyles: ["adventurous", "spontaneous"] },
  restaurant: { interests: ["food"], dateStyles: ["foodie", "romantic"] },
  attraction: { interests: ["exploring"], dateStyles: ["adventurous", "simple"] },
  exploring: { interests: ["exploring"], dateStyles: ["adventurous", "spontaneous"] },
  photography: { interests: ["photography", "exploring"], dateStyles: ["creative", "outdoors"] },
  nature: { interests: ["nature"], dateStyles: ["outdoors", "simple"] },
};

/** Search radius, in meters, scaled to how much time the couple has. */
export function radiusForDuration(duration: DurationCategory | null): number {
  switch (duration) {
    case "under_30":
      return 3_000; // ~1.9 mi
    case "1_2_hours":
      return 12_000; // ~7.5 mi
    case "3_plus_hours":
      return 32_000; // ~20 mi
    default:
      return 8_000;
  }
}

function estimatedMinutesForDuration(duration: DurationCategory | null): number {
  switch (duration) {
    case "under_30":
      return 25;
    case "3_plus_hours":
      return 210;
    default:
      return 90;
  }
}

interface GooglePlace {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  primaryType?: string;
  types?: string[];
  photos?: { name: string }[];
  editorialSummary?: { text?: string };
}

export function normalizeGooglePlace(
  place: GooglePlace,
  activityType: string,
  duration: DurationCategory | null,
  coords: Coordinates | null
): ActivityCard | null {
  const title = place.displayName?.text;
  if (!title || place.location?.latitude == null || place.location?.longitude == null) {
    return null;
  }

  const tags = TYPE_TAGS[activityType] ?? { interests: [], dateStyles: [] };
  const indoorOutdoor: IndoorOutdoor = OUTDOOR_TYPES.has(activityType)
    ? "outdoor"
    : "indoor";

  const placeCoords: Coordinates = {
    latitude: place.location.latitude,
    longitude: place.location.longitude,
  };

  return {
    id: `google:${place.id}`,
    title,
    description:
      place.editorialSummary?.text ??
      `A ${activityType.replace("_", " ")} nearby, worth a visit.`,
    durationCategory: duration ?? "1_2_hours",
    estimatedMinutes: estimatedMinutesForDuration(duration),
    activityType,
    indoorOutdoor,
    isAtHome: false,
    interests: tags.interests,
    dateStyles: tags.dateStyles,
    latitude: placeCoords.latitude,
    longitude: placeCoords.longitude,
    placeName: title,
    placeAddress: place.formattedAddress ?? null,
    externalPlaceId: place.id,
    imageUrl: place.photos?.[0]
      ? `/api/places/photo?name=${encodeURIComponent(place.photos[0].name)}`
      : null,
    emoji: null,
    distanceMiles: coords ? distanceInMiles(coords, placeCoords) : null,
  };
}
