"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  emoji?: string;
}

interface SelectPillGridProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
  multi?: boolean;
}

export function SelectPillGrid({
  options,
  selected,
  onChange,
  multi = true,
}: SelectPillGridProps) {
  function toggle(value: string) {
    if (multi) {
      onChange(
        selected.includes(value)
          ? selected.filter((v) => v !== value)
          : [...selected, value]
      );
    } else {
      onChange([value]);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <motion.button
            key={option.value}
            type="button"
            whileTap={{ scale: 0.96 }}
            aria-pressed={active}
            onClick={() => toggle(option.value)}
            className={cn(
              "flex min-h-14 items-center gap-2 rounded-2xl border px-3.5 py-3 text-left text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/40"
            )}
          >
            {option.emoji && (
              <span className="text-base" aria-hidden="true">
                {option.emoji}
              </span>
            )}
            {option.label}
          </motion.button>
        );
      })}
    </div>
  );
}
