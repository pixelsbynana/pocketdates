"use client";

import Image from "next/image";
import { Heart, MapPin, Home, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistance } from "@/lib/geo";
import type { ActivityCard as ActivityCardType } from "@/types/domain";

const DURATION_LABEL: Record<ActivityCardType["durationCategory"], string> = {
  under_30: "< 30 min",
  "1_2_hours": "1–2 hrs",
  "3_plus_hours": "3+ hrs",
};

interface ActivityCardProps {
  activity: ActivityCardType;
  onOpen?: () => void;
  onToggleFavorite?: () => void;
  favorited?: boolean;
  className?: string;
}

export function ActivityCard({
  activity,
  onOpen,
  onToggleFavorite,
  favorited,
  className,
}: ActivityCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md sm:rounded-3xl",
        className
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
        aria-label={`View ${activity.title}`}
      >
        <div className="relative aspect-4/3 w-full overflow-hidden bg-linear-to-br from-beige to-rose/25">
          {activity.imageUrl ? (
            <>
              <Image
                src={activity.imageUrl}
                alt=""
                fill
                sizes="(min-width: 768px) 340px, 90vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/40 to-transparent" />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-4xl sm:text-6xl">
              {activity.emoji ?? "🍂"}
            </div>
          )}
          {activity.isAtHome ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
              <Home className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> At home
            </span>
          ) : (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-[11px] font-medium text-foreground backdrop-blur sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
              <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> Nearby
            </span>
          )}
        </div>

        <div className="space-y-1 p-2.5 sm:space-y-1.5 sm:p-4">
          <h3 className="font-serif text-sm leading-snug text-foreground sm:text-lg">
            {activity.title}
          </h3>
          <p className="line-clamp-1 text-xs text-muted-foreground sm:line-clamp-2 sm:text-sm">
            {activity.description}
          </p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-muted-foreground sm:text-xs">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {DURATION_LABEL[activity.durationCategory]}
            </span>
            {activity.distanceMiles != null && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                {formatDistance(activity.distanceMiles)}
              </span>
            )}
          </div>
        </div>
      </button>

      {onToggleFavorite && (
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-pressed={favorited}
          aria-label={favorited ? "Remove from favourites" : "Save to favourites"}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-rose backdrop-blur transition-transform active:scale-90 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
        >
          <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4" fill={favorited ? "currentColor" : "none"} />
        </button>
      )}
    </motion.div>
  );
}
