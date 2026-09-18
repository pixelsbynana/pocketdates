import type { ActivityCard } from "@/types/domain";

type MapsPlace = Pick<
  ActivityCard,
  "placeName" | "placeAddress" | "latitude" | "longitude" | "externalPlaceId"
>;

/**
 * Builds a Google Maps search URL for a place, using the most accurate
 * data available. Always Google Maps — never Apple Maps.
 *
 * - A Google `externalPlaceId` gives the most precise deep link.
 * - Otherwise fall back to "name, address" or raw coordinates.
 */
export function googleMapsUrl(place: MapsPlace): string {
  const label = [place.placeName, place.placeAddress].filter(Boolean).join(", ");
  const query =
    label ||
    (place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : "");

  const params = new URLSearchParams({ api: "1", query: query || "" });

  if (place.externalPlaceId) {
    params.set("query_place_id", place.externalPlaceId);
  }

  return `https://www.google.com/maps/search/?${params.toString()}`;
}
