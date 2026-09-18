"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { dayKey, groupByDay, type CalendarMemory } from "@/lib/calendar";

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function CalendarView({
  memories,
  isDemo,
}: {
  memories: CalendarMemory[];
  isDemo: boolean;
}) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const byDay = useMemo(() => groupByDay(memories), [memories]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedMemories = selectedDay ? byDay.get(dayKey(selectedDay)) ?? [] : [];

  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-foreground">
          {format(month, "MMMM yyyy")}
        </h1>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="Previous month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="Next month"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAY_LABELS.map((d, i) => (
          <div key={i}>{d}</div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={month.toISOString()}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="grid grid-cols-7 gap-1.5"
        >
          {days.map((day) => {
            const inMonth = isSameMonth(day, month);
            const entries = byDay.get(dayKey(day)) ?? [];
            const photo = entries.find((e) => e.photoUrl)?.photoUrl ?? null;
            const hasMemoryWithoutPhoto = entries.length > 0 && !photo;

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                disabled={!inMonth}
                className={cn(
                  "relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border text-sm transition-transform active:scale-95",
                  inMonth ? "border-border/70 bg-card" : "border-transparent opacity-0",
                  hasMemoryWithoutPhoto && "border-accent bg-accent",
                  isToday(day) && "border-primary"
                )}
              >
                {photo && (
                  <>
                    <Image src={photo} alt="" fill sizes="60px" className="object-cover" />
                    <div className="absolute inset-0 bg-black/25" />
                  </>
                )}
                <span
                  className={cn(
                    "relative z-10 font-medium",
                    photo
                      ? "text-white"
                      : hasMemoryWithoutPhoto
                        ? "text-accent-foreground"
                        : "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
              </button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      <Drawer open={Boolean(selectedDay)} onOpenChange={(open) => !open && setSelectedDay(null)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-serif text-xl">
              {selectedDay && format(selectedDay, "d MMMM yyyy")}
            </DrawerTitle>
          </DrawerHeader>
          <div className="space-y-3 px-4 pb-6">
            {selectedMemories.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-muted-foreground">Nothing here yet.</p>
                <Button
                  render={<Link href="/discover" />}
                  nativeButton={false}
                  className="rounded-full"
                >
                  Plan a date
                </Button>
              </div>
            ) : (
              selectedMemories.map((m) =>
                m.isDemo ? (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-2xl border border-border p-3"
                  >
                    {m.photoUrl && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image src={m.photoUrl} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">{m.title}</p>
                      <p className="text-xs text-muted-foreground">Sample memory</p>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={m.id}
                    href={`/memories/${m.id}`}
                    className="flex items-center gap-3 rounded-2xl border border-border p-3 transition-colors hover:bg-secondary/50"
                  >
                    {m.photoUrl && (
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                        <Image src={m.photoUrl} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <p className="font-medium text-foreground">{m.title}</p>
                  </Link>
                )
              )
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {isDemo && (
        <p className="text-center text-xs text-muted-foreground">
          Sample calendar — sign up to build your own.
        </p>
      )}
    </div>
  );
}
