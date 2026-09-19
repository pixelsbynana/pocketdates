"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import { formatMemoryDate } from "@/lib/format-date";

interface MemoryFeedCardProps {
  href: string;
  title: string;
  notes: string;
  placeName: string | null;
  completedAt: string;
  photoUrls: string[];
}

const MAX_VISIBLE_PHOTOS = 3;

export function MemoryFeedCard({
  href,
  title,
  notes,
  placeName,
  completedAt,
  photoUrls,
}: MemoryFeedCardProps) {
  const date = new Date(completedAt);
  const visible = photoUrls.slice(0, MAX_VISIBLE_PHOTOS);
  const remaining = photoUrls.length - visible.length;

  return (
    <Link
      href={href}
      className="block overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <p className="px-5 pt-4 text-sm font-semibold text-primary">
        {formatMemoryDate(date)}
      </p>

      {/* A fixed section ratio keeps card heights consistent across the
          feed; the number of columns inside — and so each photo's own
          displayed ratio — adapts to how many photos this memory has. */}
      <div className="relative mt-2 aspect-3/2 w-full bg-muted">
        {visible.length === 0 && (
          <div className="flex h-full w-full items-center justify-center text-4xl">🍂</div>
        )}

        {visible.length === 1 && (
          <Image
            src={visible[0]}
            alt=""
            fill
            sizes="(min-width: 768px) 600px, 100vw"
            className="object-cover"
          />
        )}

        {visible.length > 1 && (
          <div
            className="grid h-full w-full gap-0.5"
            style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
          >
            {visible.map((url, i) => {
              const isLastWithMore = remaining > 0 && i === visible.length - 1;
              return (
                <div key={url} className="relative h-full w-full overflow-hidden">
                  <Image
                    src={url}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 200px, 33vw"
                    className="object-cover"
                  />
                  {isLastWithMore && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                      <span className="text-lg font-semibold text-white">+{remaining}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-1 p-5">
        <h3 className="font-serif text-xl text-foreground">{title}</h3>
        {placeName && (
          <p className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> {placeName}
          </p>
        )}
        {notes && (
          <p className="line-clamp-2 pt-1 font-handwritten text-xl leading-snug text-foreground/80">
            &ldquo;{notes}&rdquo;
          </p>
        )}
      </div>
    </Link>
  );
}
