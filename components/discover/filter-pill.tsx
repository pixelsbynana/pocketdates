"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FilterPillProps {
  label: string;
  icon?: ReactNode;
  active: boolean;
  onClick: () => void;
}

export function FilterPill({ label, icon, active, onClick }: FilterPillProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-foreground hover:border-primary/40"
      )}
    >
      {icon}
      {label}
    </motion.button>
  );
}
