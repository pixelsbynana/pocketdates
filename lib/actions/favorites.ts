"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureActivityExists } from "./activities";
import type { ActivityCard } from "@/types/domain";

export async function toggleFavorite(
  card: ActivityCard
): Promise<{ favorited: boolean } | { error: "unauthenticated" | "failed" }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "unauthenticated" };

  try {
    const activityId = await ensureActivityExists(card);

    const { data: existing } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("activity_id", activityId)
      .maybeSingle();

    if (existing) {
      await supabase.from("favorites").delete().eq("id", existing.id);
      revalidatePath("/discover");
      revalidatePath("/favorites");
      return { favorited: false };
    }

    await supabase
      .from("favorites")
      .insert({ user_id: user.id, activity_id: activityId });
    revalidatePath("/discover");
    revalidatePath("/favorites");
    return { favorited: true };
  } catch {
    return { error: "failed" };
  }
}

export async function getFavoritedActivityCards() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: favorites } = await supabase
    .from("favorites")
    .select("activity_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!favorites?.length) return [];

  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .in(
      "id",
      favorites.map((f) => f.activity_id)
    );

  const byId = new Map((activities ?? []).map((a) => [a.id, a]));
  return favorites
    .map((f) => byId.get(f.activity_id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a));
}
