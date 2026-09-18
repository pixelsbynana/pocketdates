import type {
  DateStyle,
  DurationCategory,
  IndoorOutdoor,
  Interest,
} from "./database";

/** An activity idea shown on Discover — either a curated seed row or a
 * real nearby place resolved from Google Places, normalised to one shape. */
export interface ActivityCard {
  id: string;
  title: string;
  description: string;
  durationCategory: DurationCategory;
  estimatedMinutes: number;
  activityType: string;
  indoorOutdoor: IndoorOutdoor;
  isAtHome: boolean;
  interests: Interest[];
  dateStyles: DateStyle[];
  latitude: number | null;
  longitude: number | null;
  placeName: string | null;
  placeAddress: string | null;
  externalPlaceId: string | null;
  imageUrl: string | null;
  /** A relevant emoji shown instead of a photo for curated seed ideas —
   * null for real Google Places results, which use `imageUrl` instead. */
  emoji: string | null;
  distanceMiles: number | null;
  isFavorited?: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface OnboardingData {
  firstName: string;
  partnerName: string;
  interests: Interest[];
  dateStyles: DateStyle[];
}
