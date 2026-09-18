"use client";

import { Zap, Clock, CalendarDays } from "lucide-react";
import { FilterPill } from "@/components/discover/filter-pill";
import type { DurationCategory } from "@/types/database";

const OPTIONS: { value: DurationCategory; label: string; icon: typeof Zap }[] = [
  { value: "under_30", label: "30 min", icon: Zap },
  { value: "1_2_hours", label: "1–2 hr", icon: Clock },
  { value: "3_plus_hours", label: "3+ hr", icon: CalendarDays },
];

interface DurationSelectorProps {
  value: DurationCategory | null;
  onChange: (value: DurationCategory | null) => void;
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  return (
    <div
      role="group"
      aria-label="How much time do you have?"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar md:mx-0 md:flex-wrap md:px-0"
    >
      <FilterPill label="All time" active={value === null} onClick={() => onChange(null)} />
      {OPTIONS.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <FilterPill
            key={option.value}
            label={option.label}
            icon={<Icon className="h-3.5 w-3.5" />}
            active={active}
            onClick={() => onChange(active ? null : option.value)}
          />
        );
      })}
    </div>
  );
}
