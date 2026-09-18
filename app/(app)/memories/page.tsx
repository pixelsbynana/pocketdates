import Link from "next/link";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getMemoriesForCurrentUser, computeStats } from "@/services/memories";
import { MemoryFeedCard } from "@/components/memories/memory-feed-card";
import { MemoryStatsBanner } from "@/components/memories/memory-stats";
import { DEMO_MEMORIES } from "@/lib/demo-data";
import { Button } from "@/components/ui/button";

export default async function MemoriesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-6 pb-6">
        <Header isDemo />
        <div className="rounded-2xl border border-dashed border-primary/40 bg-secondary/50 px-4 py-2.5 text-center text-xs font-medium text-primary">
          You&apos;re viewing sample memories —{" "}
          <Link href="/signup" className="underline">
            sign up
          </Link>{" "}
          to start your own.
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {DEMO_MEMORIES.map((m) => (
            <MemoryFeedCard
              key={m.id}
              href="/signup"
              title={m.title}
              notes={m.notes}
              placeName={m.placeName}
              completedAt={m.completedAt}
              photoUrls={[m.photoUrl]}
            />
          ))}
        </div>
      </div>
    );
  }

  const memories = await getMemoriesForCurrentUser();
  const stats = computeStats(memories);

  return (
    <div className="space-y-6 pb-6">
      <Header isDemo={false} />

      {memories.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <MemoryStatsBanner stats={stats} />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {memories.map((m) => (
              <MemoryFeedCard
                key={m.id}
                href={`/memories/${m.id}`}
                title={m.title}
                notes={m.notes}
                placeName={m.placeName}
                completedAt={m.completedAt}
                photoUrls={m.photos.map((p) => p.url)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function Header({ isDemo }: { isDemo: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="font-serif text-2xl text-foreground">Memories</h1>
        <p className="text-sm text-muted-foreground">Your little archive together.</p>
      </div>
      <Button
        render={<Link href={isDemo ? "/signup" : "/memories/new"} />}
        nativeButton={false}
        size="sm"
        className="rounded-full"
      >
        <Plus className="h-4 w-4" /> Add
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border px-6 py-20 text-center">
      <p className="font-serif text-xl text-foreground">Your little archive is empty.</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Go make your first memory together.
      </p>
      <Button
        render={<Link href="/discover" />}
        nativeButton={false}
        size="lg"
        className="mt-2 rounded-full"
      >
        Find a date
      </Button>
    </div>
  );
}
