import { createClient } from "@/lib/supabase/server";

export interface MemoryPhoto {
  id: string;
  storagePath: string;
  url: string;
  width: number | null;
  height: number | null;
}

export interface MemoryWithPhotos {
  id: string;
  title: string;
  notes: string;
  completedAt: string;
  placeName: string | null;
  placeAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  activityId: string | null;
  externalPlaceId: string | null;
  photos: MemoryPhoto[];
}

function photoUrl(supabase: Awaited<ReturnType<typeof createClient>>, path: string) {
  return supabase.storage.from("memory-photos").getPublicUrl(path).data.publicUrl;
}

export async function getMemoriesForCurrentUser(): Promise<MemoryWithPhotos[]> {
  const supabase = await createClient();

  const { data: memories, error } = await supabase
    .from("memories")
    .select("*")
    .order("completed_at", { ascending: false });

  if (error || !memories?.length) return [];

  const { data: photos } = await supabase
    .from("memory_photos")
    .select("*")
    .in(
      "memory_id",
      memories.map((m) => m.id)
    )
    .order("created_at", { ascending: true });

  const { data: activities } = await supabase
    .from("activities")
    .select("id, external_place_id")
    .in(
      "id",
      memories.map((m) => m.activity_id).filter((id): id is string => Boolean(id))
    );

  const externalIdByActivity = new Map(
    (activities ?? []).map((a) => [a.id, a.external_place_id])
  );

  const photosByMemory = new Map<string, MemoryPhoto[]>();
  for (const p of photos ?? []) {
    const list = photosByMemory.get(p.memory_id) ?? [];
    list.push({
      id: p.id,
      storagePath: p.storage_path,
      url: photoUrl(supabase, p.storage_path),
      width: p.width,
      height: p.height,
    });
    photosByMemory.set(p.memory_id, list);
  }

  return memories.map((m) => ({
    id: m.id,
    title: m.title,
    notes: m.notes,
    completedAt: m.completed_at,
    placeName: m.place_name,
    placeAddress: m.place_address,
    latitude: m.latitude,
    longitude: m.longitude,
    activityId: m.activity_id,
    externalPlaceId: m.activity_id ? externalIdByActivity.get(m.activity_id) ?? null : null,
    photos: photosByMemory.get(m.id) ?? [],
  }));
}

export async function getMemoryById(id: string): Promise<MemoryWithPhotos | null> {
  const supabase = await createClient();

  const { data: memory } = await supabase
    .from("memories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!memory) return null;

  const { data: photos } = await supabase
    .from("memory_photos")
    .select("*")
    .eq("memory_id", id)
    .order("created_at", { ascending: true });

  let externalPlaceId: string | null = null;
  if (memory.activity_id) {
    const { data: activity } = await supabase
      .from("activities")
      .select("external_place_id")
      .eq("id", memory.activity_id)
      .maybeSingle();
    externalPlaceId = activity?.external_place_id ?? null;
  }

  return {
    id: memory.id,
    title: memory.title,
    notes: memory.notes,
    completedAt: memory.completed_at,
    placeName: memory.place_name,
    placeAddress: memory.place_address,
    latitude: memory.latitude,
    longitude: memory.longitude,
    activityId: memory.activity_id,
    externalPlaceId,
    photos: (photos ?? []).map((p) => ({
      id: p.id,
      storagePath: p.storage_path,
      url: photoUrl(supabase, p.storage_path),
      width: p.width,
      height: p.height,
    })),
  };
}

export interface MemoryStats {
  totalMemories: number;
  uniquePlaces: number;
  memoriesThisYear: number;
  newPlacesThisYear: number;
}

export function computeStats(memories: MemoryWithPhotos[]): MemoryStats {
  const currentYear = new Date().getFullYear();
  const places = new Set(memories.filter((m) => m.placeName).map((m) => m.placeName));
  const thisYear = memories.filter(
    (m) => new Date(m.completedAt).getFullYear() === currentYear
  );
  const placesThisYear = new Set(
    thisYear.filter((m) => m.placeName).map((m) => m.placeName)
  );

  return {
    totalMemories: memories.length,
    uniquePlaces: places.size,
    memoriesThisYear: thisYear.length,
    newPlacesThisYear: placesThisYear.size,
  };
}
