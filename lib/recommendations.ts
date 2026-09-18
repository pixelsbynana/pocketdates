import type { Database, DateStyle, DurationCategory, Interest } from "@/types/database";
import type { ActivityCard, Coordinates } from "@/types/domain";
import { distanceInMiles } from "@/lib/geo";

type ActivityRow = Database["public"]["Tables"]["activities"]["Row"];

export interface DiscoverFilters {
  duration: DurationCategory | null;
  location: "any" | "at_home" | "nearby";
}

export interface RecommendationContext {
  interests: Interest[];
  dateStyles: DateStyle[];
  coords: Coordinates | null;
  /** activity_type values completed in roughly the last two weeks */
  recentActivityTypes: Set<string>;
  /** exact activity ids completed in roughly the last two months — hard-excluded */
  recentActivityIds: Set<string>;
  favoritedActivityIds: Set<string>;
}

const MAX_NEARBY_DISTANCE_MILES = 25;

export function toActivityCard(
  row: ActivityRow,
  coords: Coordinates | null
): ActivityCard {
  const distanceMiles =
    coords && row.latitude != null && row.longitude != null
      ? distanceInMiles(coords, { latitude: row.latitude, longitude: row.longitude })
      : null;

  return {
    id: row.id,
    title: row.title,
    description: row.description,
    durationCategory: row.duration_category,
    estimatedMinutes: row.estimated_minutes,
    activityType: row.activity_type,
    indoorOutdoor: row.indoor_outdoor,
    isAtHome: row.is_at_home,
    interests: row.interests,
    dateStyles: row.date_styles,
    latitude: row.latitude,
    longitude: row.longitude,
    placeName: row.place_name,
    placeAddress: row.place_address,
    externalPlaceId: row.external_place_id,
    imageUrl: row.image_url,
    emoji: row.emoji,
    distanceMiles,
  };
}

function overlapCount<T>(a: T[], b: T[]): number {
  if (!a.length || !b.length) return 0;
  const set = new Set(b);
  let count = 0;
  for (const item of a) if (set.has(item)) count++;
  return count;
}

/** Deterministic, explainable score — higher is better. No AI involved. */
export function scoreActivity(
  activity: ActivityCard,
  ctx: RecommendationContext
): number {
  let score = 0;

  score += overlapCount(activity.interests, ctx.interests) * 3;
  score += overlapCount(activity.dateStyles, ctx.dateStyles) * 2;

  if (ctx.favoritedActivityIds.has(activity.id)) score += 1;

  // Deprioritize activity types recently completed, to encourage variety.
  if (ctx.recentActivityTypes.has(activity.activityType)) score -= 4;

  // Closer real places score a little higher than far-away ones.
  if (activity.distanceMiles != null) {
    if (activity.distanceMiles > MAX_NEARBY_DISTANCE_MILES) score -= 3;
    else score += Math.max(0, 3 - activity.distanceMiles / 5);
  }

  return score;
}

export function applyFilters(
  activities: ActivityCard[],
  filters: DiscoverFilters
): ActivityCard[] {
  return activities.filter((a) => {
    if (filters.duration && a.durationCategory !== filters.duration) return false;
    if (filters.location === "at_home" && !a.isAtHome) return false;
    if (filters.location === "nearby" && a.isAtHome) return false;
    return true;
  });
}

export function rankActivities(
  activities: ActivityCard[],
  ctx: RecommendationContext
): ActivityCard[] {
  return activities
    .filter((a) => !ctx.recentActivityIds.has(a.id))
    .map((a) => ({ activity: a, score: scoreActivity(a, ctx) }))
    .sort((x, y) => {
      if (y.score !== x.score) return y.score - x.score;
      // Stable, deterministic tiebreak so ordering doesn't jump around.
      return x.activity.title.localeCompare(y.activity.title);
    })
    .map((x) => x.activity);
}

/** Picks a genuinely random activity from the strongest-scoring candidates. */
export function surpriseActivity(
  activities: ActivityCard[],
  ctx: RecommendationContext,
  exclude: Set<string> = new Set()
): ActivityCard | null {
  const ranked = rankActivities(activities, ctx).filter((a) => !exclude.has(a.id));
  if (!ranked.length) return null;

  const pool = ranked.slice(0, Math.max(3, Math.ceil(ranked.length * 0.3)));
  return pool[Math.floor(Math.random() * pool.length)];
}
