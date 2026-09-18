import type { ActivityCard } from "@/types/domain";

const STORAGE_KEY = "pocketdates_pending_action";

export type PendingAction =
  | { type: "favorite"; activity: ActivityCard }
  | { type: "save_memory"; activity: ActivityCard };

export function setPendingAction(action: PendingAction) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — non-fatal.
  }
}

export function getPendingAction(): PendingAction | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingAction) : null;
  } catch {
    return null;
  }
}

export function clearPendingAction() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
