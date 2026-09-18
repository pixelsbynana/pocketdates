import type { Interest, DateStyle } from "@/types/database";

/** Realistic mock data so visitors can explore Pocket Dates before making
 * an account. Clearly separated from real user data — never written to
 * Supabase, and every demo memory id is prefixed so it can't collide with
 * a real UUID. */
export const DEMO_PROFILE = {
  firstName: "Alex",
  partnerName: "Sam",
  coupleSince: "2023-04-12",
};

export const DEMO_PREFERENCES: {
  interests: Interest[];
  dateStyles: DateStyle[];
} = {
  interests: ["food", "coffee", "nature", "films", "cooking", "photography"],
  dateStyles: ["cozy", "romantic", "spontaneous"],
};

export interface DemoMemory {
  id: string;
  title: string;
  notes: string;
  placeName: string | null;
  completedAt: string;
  photoUrl: string;
}

export const DEMO_MEMORIES: DemoMemory[] = [
  {
    id: "demo-1",
    title: "Sunset Walk",
    notes: "We got bubble tea and watched the sunset. Perfect first-of-autumn evening.",
    placeName: "Richmond Park",
    completedAt: "2026-09-06T18:42:00.000Z",
    photoUrl: "/sunset.jpg",
  },
  {
    id: "demo-2",
    title: "Rainy Day Ramen",
    notes: "Ducked in from the rain and ended up staying for two hours talking.",
    placeName: "Ono Ramen",
    completedAt: "2026-08-22T13:10:00.000Z",
    photoUrl: "/ramen.jpg",
  },
  {
    id: "demo-3",
    title: "Museum Wander",
    notes: "Spent way too long in the impressionist wing. Worth it.",
    placeName: "City Art Museum",
    completedAt: "2026-08-02T15:30:00.000Z",
    photoUrl: "/museum.jpg",
  },
  {
    id: "demo-4",
    title: "Homemade Pasta Night",
    notes: "Neither of us had made pasta from scratch before. Flour everywhere.",
    placeName: null,
    completedAt: "2026-07-19T19:00:00.000Z",
    photoUrl: "/pasta.jpg",
  },
  {
    id: "demo-5",
    title: "Arcade Rematch",
    notes: "Lost three rounds of skee-ball in a row. Rematch pending.",
    placeName: "Neon Alley Arcade",
    completedAt: "2026-06-28T20:15:00.000Z",
    photoUrl: "/arcade.jpg",
  },
  {
    id: "demo-6",
    title: "Farmers Market Morning",
    notes: "Bought too many peaches. Zero regrets.",
    placeName: "Riverside Market",
    completedAt: "2026-06-14T10:20:00.000Z",
    photoUrl: "/market.jpg",
  },
];

export const IS_DEMO_ID_PREFIX = "demo-";
export function isDemoId(id: string) {
  return id.startsWith(IS_DEMO_ID_PREFIX);
}
