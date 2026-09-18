"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActivityCard } from "@/types/domain";

/**
 * Activities from the seed catalog already have a stable database id.
 * Real places from Google Places don't exist in `activities` yet — this
 * upserts them (keyed by external_place_id) the first time someone
 * favourites or saves a memory for one, and returns the real row id.
 */
export async function ensureActivityExists(card: ActivityCard): Promise<string> {
  if (!card.id.startsWith("google:")) {
    return card.id;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("activities")
    .upsert(
      {
        title: card.title,
        description: card.description,
        duration_category: card.durationCategory,
        estimated_minutes: card.estimatedMinutes,
        activity_type: card.activityType,
        indoor_outdoor: card.indoorOutdoor,
        is_at_home: false,
        is_seed: false,
        interests: card.interests,
        date_styles: card.dateStyles,
        latitude: card.latitude,
        longitude: card.longitude,
        place_name: card.placeName,
        place_address: card.placeAddress,
        external_place_id: card.externalPlaceId,
        image_url: card.imageUrl,
      },
      { onConflict: "external_place_id" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}
