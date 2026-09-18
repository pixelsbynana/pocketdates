"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function to12Hour(date: Date) {
  const h = date.getHours();
  return {
    hour: h % 12 === 0 ? 12 : h % 12,
    minute: date.getMinutes(),
    period: h < 12 ? "AM" : ("PM" as "AM" | "PM"),
  };
}

function withTime(date: Date, hour: number, minute: number, period: "AM" | "PM") {
  const next = new Date(date);
  const hour24 = period === "PM" ? (hour % 12) + 12 : hour % 12;
  next.setHours(hour24, minute, 0, 0);
  return next;
}

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

export function DateTimePicker({ value, onChange, label = "Date & time" }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const { hour, minute, period } = to12Hour(draft);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(value);
    setOpen(next);
  }

  function confirm() {
    onChange(draft);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex h-10 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 text-left text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
        {format(value, "d MMM yyyy, h:mm a")}
      </button>

      <Drawer open={open} onOpenChange={handleOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="font-serif text-xl">{label}</DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col items-center gap-4 px-4 pb-2">
            <Calendar
              mode="single"
              weekStartsOn={1}
              selected={draft}
              onSelect={(day) => {
                if (!day) return;
                setDraft((prev) => {
                  const next = new Date(prev);
                  next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
                  return next;
                });
              }}
            />

            <div className="flex w-full items-center justify-center gap-2">
              <Select
                value={String(hour)}
                onValueChange={(v) => setDraft(withTime(draft, Number(v), minute, period))}
              >
                <SelectTrigger className="w-20 justify-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">:</span>
              <Select
                value={String(minute).padStart(2, "0")}
                onValueChange={(v) => setDraft(withTime(draft, hour, Number(v), period))}
              >
                <SelectTrigger className="w-20 justify-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MINUTES.map((m) => (
                    <SelectItem key={m} value={String(m).padStart(2, "0")}>
                      {String(m).padStart(2, "0")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={period}
                onValueChange={(v) => setDraft(withTime(draft, hour, minute, v as "AM" | "PM"))}
              >
                <SelectTrigger className="w-20 justify-center">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DrawerFooter>
            <Button type="button" className="w-full rounded-full" onClick={confirm}>
              Done
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
