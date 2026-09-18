import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { MAX_PHOTOS_PER_MEMORY } from "@/lib/constants";

export { MAX_PHOTOS_PER_MEMORY };

const MAX_SIZE_MB = 1.5;
const MAX_DIMENSION = 1920;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type) && !file.type.startsWith("image/")) {
    return "That file doesn't look like a photo.";
  }
  if (file.size > MAX_ORIGINAL_BYTES) {
    return "That photo is too large — try one under 25MB.";
  }
  return null;
}

async function getImageDimensions(file: File | Blob): Promise<{ width: number; height: number } | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const dims = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dims;
  } catch {
    return null;
  }
}

interface UploadedPhoto {
  path: string;
  width: number | null;
  height: number | null;
}

async function compressAndUpload(
  userId: string,
  path: string,
  file: File
): Promise<UploadedPhoto> {
  const compressed = await imageCompression(file, {
    maxSizeMB: MAX_SIZE_MB,
    maxWidthOrHeight: MAX_DIMENSION,
    useWebWorker: true,
    fileType: "image/webp",
  });

  const dims = await getImageDimensions(compressed);

  const supabase = createClient();
  const { error: uploadError } = await supabase.storage
    .from("memory-photos")
    .upload(path, compressed, { contentType: "image/webp", upsert: false });

  if (uploadError) throw uploadError;

  return { path, width: dims?.width ?? null, height: dims?.height ?? null };
}

/** Compresses and uploads a photo ahead of it being linked to a memory —
 * used by both the new-memory and edit forms so photos start uploading
 * the moment they're picked, rather than waiting until the whole form is
 * submitted. Doesn't touch the database; call `addMemoryPhoto` once the
 * memory exists (or already does, when editing). */
export async function uploadPhotoToStaging(
  userId: string,
  file: File
): Promise<{ ok: true; photo: UploadedPhoto } | { error: string }> {
  const validationError = validatePhotoFile(file);
  if (validationError) return { error: validationError };

  try {
    const photo = await compressAndUpload(
      userId,
      `${userId}/pending/${crypto.randomUUID()}.webp`,
      file
    );
    return { ok: true, photo };
  } catch (error) {
    console.error("Photo upload failed:", error);
    return { error: "Couldn't upload that photo — please try again." };
  }
}

/** Removes a photo the user picked and then removed before saving —
 * whether it never made it into a memory (uploaded to staging) or they
 * changed their mind. RLS enforces this can only ever hit the caller's
 * own folder. */
export async function deleteStagingPhoto(path: string): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.storage.from("memory-photos").remove([path]);
  } catch (error) {
    console.error("Couldn't clean up an unused photo:", error);
  }
}
