"use client";

import { MapPin, Home } from "lucide-react";
import { FilterPill } from "@/components/discover/filter-pill";
import type { DiscoverFilters } from "@/lib/recommendations";

interface LocationSelectorProps {
  value: DiscoverFilters["location"];
  onChange: (value: DiscoverFilters["location"]) => void;
}

export function LocationSelector({ value, onChange }: LocationSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Where would you like to go?"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:flex-wrap md:px-0"
    >
      <FilterPill label="Anywhere" active={value === "any"} onClick={() => onChange("any")} />
      <FilterPill
        label="Nearby"
        icon={<MapPin className="h-3.5 w-3.5" />}
        active={value === "nearby"}
        onClick={() => onChange(value === "nearby" ? "any" : "nearby")}
      />
      <FilterPill
        label="Home"
        icon={<Home className="h-3.5 w-3.5" />}
        active={value === "at_home"}
        onClick={() => onChange(value === "at_home" ? "any" : "at_home")}
      />
    </div>
  );
}
