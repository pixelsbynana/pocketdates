import { createClient } from "@/lib/supabase/server";
import { isDynamicServerError } from "@/lib/is-dynamic-server-error";
import type { Coordinates } from "@/types/domain";
import { toActivityCard } from "@/lib/recommendations";
import type { RecommendationContext } from "@/lib/recommendations";
import { DEMO_PREFERENCES } from "@/lib/demo-data";

const RECENT_TYPE_WINDOW_DAYS = 14;
const RECENT_ID_WINDOW_DAYS = 60;

export async function getSeedActivities(coords: Coordinates | null) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("is_seed", true);

    if (error) throw error;
    return (data ?? []).map((row) => toActivityCard(row, coords));
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error("Couldn't load activities from Supabase:", error);
    return [];
  }
}

export async function getActivityById(id: string, coords: Coordinates | null) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data ? toActivityCard(data, coords) : null;
}

/** Builds the personalization context for a signed-in user from their
 * preferences and memory history. */
export async function getRecommendationContext(
  userId: string,
  coords: Coordinates | null
): Promise<RecommendationContext> {
  const supabase = await createClient();

  const [{ data: prefs }, { data: recentMemories }, { data: favorites }] =
    await Promise.all([
      supabase
        .from("user_preferences")
        .select("interests, date_styles")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("memories")
        .select("activity_id, completed_at")
        .eq("user_id", userId)
        .gte(
          "completed_at",
          new Date(Date.now() - RECENT_ID_WINDOW_DAYS * 86_400_000).toISOString()
        ),
      supabase.from("favorites").select("activity_id").eq("user_id", userId),
    ]);

  const recentTypeCutoff = Date.now() - RECENT_TYPE_WINDOW_DAYS * 86_400_000;
  const recentActivityTypes = new Set<string>();
  const recentActivityIds = new Set<string>();

  const recentActivityIdList = (recentMemories ?? [])
    .map((m) => m.activity_id)
    .filter((id): id is string => Boolean(id));

  const { data: recentActivityRows } = recentActivityIdList.length
    ? await supabase
        .from("activities")
        .select("id, activity_type")
        .in("id", recentActivityIdList)
    : { data: [] as { id: string; activity_type: string }[] };

  const activityTypeById = new Map(
    (recentActivityRows ?? []).map((a) => [a.id, a.activity_type])
  );

  for (const m of recentMemories ?? []) {
    if (!m.activity_id) continue;
    recentActivityIds.add(m.activity_id);
    const activityType = activityTypeById.get(m.activity_id);
    if (activityType && new Date(m.completed_at).getTime() >= recentTypeCutoff) {
      recentActivityTypes.add(activityType);
    }
  }

  return {
    interests: prefs?.interests ?? [],
    dateStyles: prefs?.date_styles ?? [],
    coords,
    recentActivityTypes,
    recentActivityIds,
    favoritedActivityIds: new Set((favorites ?? []).map((f) => f.activity_id)),
  };
}

export function demoRecommendationContext(
  coords: Coordinates | null
): RecommendationContext {
  return {
    interests: DEMO_PREFERENCES.interests,
    dateStyles: DEMO_PREFERENCES.dateStyles,
    coords,
    recentActivityTypes: new Set(),
    recentActivityIds: new Set(),
    favoritedActivityIds: new Set(),
  };
}
