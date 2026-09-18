export interface CalendarMemory {
  id: string;
  date: Date;
  title: string;
  photoUrl: string | null;
  isDemo?: boolean;
}

export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function groupByDay(memories: CalendarMemory[]): Map<string, CalendarMemory[]> {
  const map = new Map<string, CalendarMemory[]>();
  for (const m of memories) {
    const key = dayKey(m.date);
    const list = map.get(key) ?? [];
    list.push(m);
    map.set(key, list);
  }
  return map;
}
