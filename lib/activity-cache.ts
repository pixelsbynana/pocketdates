import type { ActivityCard } from "@/types/domain";

const PREFIX = "pocketdates_activity_";

/** Caches a not-yet-persisted (Google Places) activity in sessionStorage so
 * the detail route — a fresh navigation, no router state available — can
 * render it without re-fetching from Places. */
export function cacheActivity(activity: ActivityCard) {
  try {
    sessionStorage.setItem(PREFIX + activity.id, JSON.stringify(activity));
  } catch {
    // ignore
  }
}

export function getCachedActivity(id: string): ActivityCard | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + id);
    return raw ? (JSON.parse(raw) as ActivityCard) : null;
  } catch {
    return null;
  }
}
