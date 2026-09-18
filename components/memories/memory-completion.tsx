"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export function MemoryCompletion() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 px-6 text-center backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.05 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-accent text-accent-foreground"
      >
        <Heart className="h-10 w-10" fill="currentColor" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="font-serif text-2xl text-foreground">Date saved ❤️</p>
        <p className="mt-1 text-sm text-muted-foreground">
          You&apos;ve made another memory together.
        </p>
      </motion.div>
    </motion.div>
  );
}
