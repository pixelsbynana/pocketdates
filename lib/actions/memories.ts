"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureActivityExists } from "@/lib/actions/activities";
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH, MAX_LOCATION_LENGTH } from "@/lib/constants";
import type { ActivityCard } from "@/types/domain";

export interface CreateMemoryInput {
  title: string;
  notes: string;
  completedAt: string;
  placeName: string | null;
  placeAddress: string | null;
  latitude: number | null;
  longitude: number | null;
  activity: ActivityCard | null;
}

export async function createMemory(
  input: CreateMemoryInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "unauthenticated" };
  if (!input.title.trim()) return { error: "Give your memory a title." };
  if (input.title.length > MAX_TITLE_LENGTH) {
    return { error: `Title can be up to ${MAX_TITLE_LENGTH} characters.` };
  }
  if (input.placeName && input.placeName.length > MAX_LOCATION_LENGTH) {
    return { error: `Location can be up to ${MAX_LOCATION_LENGTH} characters.` };
  }
  if (input.notes.length > MAX_NOTES_LENGTH) {
    return { error: `Notes can be up to ${MAX_NOTES_LENGTH} characters.` };
  }

  try {
    const activityId = input.activity
      ? await ensureActivityExists(input.activity)
      : null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("couple_id")
      .eq("id", user.id)
      .maybeSingle();

    const { data, error } = await supabase
      .from("memories")
      .insert({
        user_id: user.id,
        couple_id: profile?.couple_id ?? null,
        activity_id: activityId,
        title: input.title.trim(),
        notes: input.notes.trim(),
        completed_at: input.completedAt,
        place_name: input.placeName,
        place_address: input.placeAddress,
        latitude: input.latitude,
        longitude: input.longitude,
      })
      .select("id")
      .single();

    if (error) throw error;

    revalidatePath("/memories");
    revalidatePath("/calendar");
    return { id: data.id };
  } catch (error) {
    console.error("Couldn't create memory:", error);
    return { error: "Couldn't save that memory — please try again." };
  }
}

export async function updateMemory(
  id: string,
  input: Pick<CreateMemoryInput, "title" | "notes" | "completedAt" | "placeName">
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };
  if (!input.title.trim()) return { error: "Give your memory a title." };
  if (input.title.length > MAX_TITLE_LENGTH) {
    return { error: `Title can be up to ${MAX_TITLE_LENGTH} characters.` };
  }
  if (input.placeName && input.placeName.length > MAX_LOCATION_LENGTH) {
    return { error: `Location can be up to ${MAX_LOCATION_LENGTH} characters.` };
  }
  if (input.notes.length > MAX_NOTES_LENGTH) {
    return { error: `Notes can be up to ${MAX_NOTES_LENGTH} characters.` };
  }

  const { error } = await supabase
    .from("memories")
    .update({
      title: input.title.trim(),
      notes: input.notes.trim(),
      completed_at: input.completedAt,
      place_name: input.placeName,
    })
    .eq("id", id);

  if (error) return { error: "Couldn't save your changes — please try again." };

  revalidatePath("/memories");
  revalidatePath(`/memories/${id}`);
  revalidatePath("/calendar");
  return { ok: true };
}

export async function deleteMemory(id: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const { data: photos } = await supabase
    .from("memory_photos")
    .select("storage_path")
    .eq("memory_id", id);

  if (photos?.length) {
    await supabase.storage
      .from("memory-photos")
      .remove(photos.map((p) => p.storage_path));
  }

  const { error } = await supabase.from("memories").delete().eq("id", id);

  if (error) return { error: "Couldn't delete that memory — please try again." };

  revalidatePath("/memories");
  revalidatePath("/calendar");
  return { ok: true };
}

export async function addMemoryPhoto(
  memoryId: string,
  storagePath: string,
  width: number | null,
  height: number | null
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("memory_photos").insert({
    memory_id: memoryId,
    storage_path: storagePath,
    width,
    height,
  });

  if (error) return { error: "Couldn't attach that photo — please try again." };
  revalidatePath(`/memories/${memoryId}`);
  return { ok: true };
}

export async function deleteMemoryPhoto(
  photoId: string,
  storagePath: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  await supabase.storage.from("memory-photos").remove([storagePath]);
  const { error } = await supabase.from("memory_photos").delete().eq("id", photoId);
  if (error) return { error: "Couldn't remove that photo — please try again." };
  return { ok: true };
}
