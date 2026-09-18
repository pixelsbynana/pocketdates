import type { DateStyle, DurationCategory, Interest } from "@/types/database";

export const APP_NAME = "Pocket Dates";
export const APP_TAGLINE = "Little plans. Big memories.";
export const MAX_PHOTOS_PER_MEMORY = 6;
export const MAX_NOTES_LENGTH = 400;
export const MAX_TITLE_LENGTH = 100;
export const MAX_LOCATION_LENGTH = 100;

export const INTEREST_OPTIONS: { value: Interest; label: string; emoji: string }[] = [
  { value: "food", label: "Food", emoji: "🍜" },
  { value: "coffee", label: "Coffee", emoji: "☕" },
  { value: "books", label: "Books", emoji: "📚" },
  { value: "films", label: "Films", emoji: "🎬" },
  { value: "gaming", label: "Gaming", emoji: "🎮" },
  { value: "nature", label: "Nature", emoji: "🌿" },
  { value: "museums", label: "Museums", emoji: "🖼️" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "cooking", label: "Cooking", emoji: "🍳" },
  { value: "fitness", label: "Fitness", emoji: "🏃" },
  { value: "arts_crafts", label: "Arts & crafts", emoji: "🎨" },
  { value: "music", label: "Music", emoji: "🎵" },
  { value: "exploring", label: "Exploring", emoji: "🧭" },
  { value: "staying_home", label: "Staying home", emoji: "🏠" },
  { value: "photography", label: "Photography", emoji: "📸" },
];

export const DATE_STYLE_OPTIONS: { value: DateStyle; label: string; emoji: string }[] = [
  { value: "cozy", label: "Cozy", emoji: "🕯️" },
  { value: "adventurous", label: "Adventurous", emoji: "🧗" },
  { value: "romantic", label: "Romantic", emoji: "🌹" },
  { value: "simple", label: "Simple", emoji: "🤍" },
  { value: "foodie", label: "Foodie", emoji: "🍽️" },
  { value: "outdoors", label: "Outdoors", emoji: "🌳" },
  { value: "creative", label: "Creative", emoji: "✨" },
  { value: "spontaneous", label: "Spontaneous", emoji: "🎲" },
];

export const DURATION_OPTIONS: {
  value: DurationCategory;
  label: string;
  sublabel: string;
  emoji: string;
}[] = [
  { value: "under_30", label: "< 30 min", sublabel: "Something little", emoji: "⏱️" },
  { value: "1_2_hours", label: "1–2 hours", sublabel: "Make an afternoon of it", emoji: "🌤️" },
  { value: "3_plus_hours", label: "3+ hours", sublabel: "Let's make a day of it", emoji: "🌅" },
];

export const NAV_ITEMS = [
  { href: "/discover", label: "Discover", icon: "Sparkles" },
  { href: "/memories", label: "Memories", icon: "Heart" },
  { href: "/calendar", label: "Calendar", icon: "CalendarHeart" },
  { href: "/profile", label: "Profile", icon: "User" },
] as const;
