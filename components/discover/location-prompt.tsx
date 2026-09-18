"use client";

import { MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GeolocationStatus } from "@/hooks/use-geolocation";

interface LocationPromptProps {
  status: GeolocationStatus;
  error: string | null;
  onEnable: () => void;
  onDismiss: () => void;
}

export function LocationPrompt({ status, error, onEnable, onDismiss }: LocationPromptProps) {
  if (status === "granted") return null;

  if (status === "denied" || status === "unavailable") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/60 p-3.5 text-sm text-muted-foreground">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
        <p className="flex-1">{error}</p>
        <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/60 p-3.5">
      <MapPin className="h-4 w-4 shrink-0 text-primary" />
      <p className="flex-1 text-sm text-foreground">
        Want ideas near you? We&apos;ll only use your location to find nearby spots.
      </p>
      <Button
        size="sm"
        variant="secondary"
        className="shrink-0 rounded-full"
        onClick={onEnable}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Finding…" : "Use location"}
      </Button>
    </div>
  );
}
