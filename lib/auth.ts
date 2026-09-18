import { createClient } from "@/lib/supabase/server";
import { isDynamicServerError } from "@/lib/is-dynamic-server-error";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserPreferences = Database["public"]["Tables"]["user_preferences"]["Row"];

/**
 * Current authenticated user, or null when browsing in demo mode — also
 * null if Supabase itself is unreachable, so a backend outage degrades to
 * the demo experience instead of a hard crash.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error("Supabase auth unavailable:", error);
    return null;
  }
}

export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    return data;
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error("Supabase unavailable:", error);
    return null;
  }
}

export async function getCurrentPreferences(): Promise<UserPreferences | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    return data;
  } catch (error) {
    if (isDynamicServerError(error)) throw error;
    console.error("Supabase unavailable:", error);
    return null;
  }
}
