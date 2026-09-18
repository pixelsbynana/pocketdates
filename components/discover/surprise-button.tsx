"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { ActivityCard } from "@/components/discover/activity-card";
import type { ActivityCard as ActivityCardType } from "@/types/domain";

interface SurpriseButtonProps {
  onSurprise: () => ActivityCardType | null;
  onView: (activity: ActivityCardType) => void;
}

export function SurpriseButton({ onSurprise, onView }: SurpriseButtonProps) {
  const [spinning, setSpinning] = useState(false);
  const [picked, setPicked] = useState<ActivityCardType | null>(null);
  const [open, setOpen] = useState(false);
  const [emptyNotice, setEmptyNotice] = useState(false);

  function handleClick() {
    setSpinning(true);
    setEmptyNotice(false);
    window.setTimeout(() => {
      const result = onSurprise();
      setSpinning(false);
      if (!result) {
        setEmptyNotice(true);
        return;
      }
      setPicked(result);
      setOpen(true);
    }, 650);
  }

  return (
    <>
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          type="button"
          size="lg"
          onClick={handleClick}
          disabled={spinning}
          className="relative w-full overflow-hidden rounded-full bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
        >
          <motion.span
            animate={spinning ? { rotate: 360 } : { rotate: 0 }}
            transition={
              spinning
                ? { repeat: Infinity, duration: 0.7, ease: "linear" }
                : { duration: 0.2 }
            }
            className="mr-2 inline-flex"
          >
            <Sparkles className="h-5 w-5" />
          </motion.span>
          {spinning ? "Picking something lovely…" : "Surprise Us"}
        </Button>
      </motion.div>

      <AnimatePresence>
        {emptyNotice && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 text-center text-sm text-muted-foreground"
          >
            Try loosening your filters — we couldn&apos;t find a fresh idea within them.
          </motion.p>
        )}
      </AnimatePresence>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <div className="mx-auto flex w-full min-h-0 max-w-md flex-1 flex-col">
            <DrawerHeader>
              <DrawerTitle className="font-serif text-2xl">
                How about this? ✨
              </DrawerTitle>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              {picked && (
                <ActivityCard activity={picked} onOpen={() => onView(picked)} />
              )}
              <Button
                size="lg"
                className="mt-4 w-full rounded-full"
                onClick={() => picked && onView(picked)}
              >
                View idea
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="mt-1 w-full rounded-full"
                onClick={handleClick}
              >
                Surprise us again
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
