import { cn } from "@/lib/utils";

export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex justify-center gap-1.5" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 rounded-full transition-all",
            i === current ? "w-6 bg-primary" : "w-1.5 bg-border"
          )}
        />
      ))}
    </div>
  );
}
