import { getCurrentUser } from "@/lib/auth";
import { getMemoriesForCurrentUser } from "@/services/memories";
import { CalendarView } from "@/components/calendar/calendar-view";
import { DEMO_MEMORIES } from "@/lib/demo-data";
import type { CalendarMemory } from "@/lib/calendar";

export default async function CalendarPage() {
  const user = await getCurrentUser();

  if (!user) {
    const memories: CalendarMemory[] = DEMO_MEMORIES.map((m) => ({
      id: m.id,
      date: new Date(m.completedAt),
      title: m.title,
      photoUrl: m.photoUrl,
      isDemo: true,
    }));
    return <CalendarView memories={memories} isDemo />;
  }

  const raw = await getMemoriesForCurrentUser();
  const memories: CalendarMemory[] = raw.map((m) => ({
    id: m.id,
    date: new Date(m.completedAt),
    title: m.title,
    photoUrl: m.photos[0]?.url ?? null,
  }));

  return <CalendarView memories={memories} isDemo={false} />;
}
