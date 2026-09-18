"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function FavoritesHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Back"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border"
      >
        <ArrowLeft className="h-4 w-4" />
      </button>
      <h1 className="font-serif text-2xl text-foreground">Favourites</h1>
    </div>
  );
}
