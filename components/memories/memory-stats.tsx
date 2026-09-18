import type { MemoryStats } from "@/services/memories";

export function MemoryStatsBanner({ stats }: { stats: MemoryStats }) {
  if (stats.totalMemories === 0) return null;

  return (
    <div className="rounded-3xl border border-border/70 bg-secondary/50 p-5">
      <p className="font-serif text-lg text-foreground">
        You&apos;ve made {stats.totalMemories}{" "}
        {stats.totalMemories === 1 ? "memory" : "memories"} together
        {stats.memoriesThisYear > 0 ? ` this year` : ""}.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-4">
        <Stat value={stats.totalMemories} label="dates together" />
        <Stat value={stats.uniquePlaces} label="places explored" />
        <Stat value={stats.memoriesThisYear} label="memories this year" />
        <Stat value={stats.newPlacesThisYear} label="new places" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-serif text-xl text-foreground">{value}</p>
      <p>{label}</p>
    </div>
  );
}
