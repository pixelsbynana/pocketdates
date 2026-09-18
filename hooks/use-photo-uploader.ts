"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  uploadPhotoToStaging,
  validatePhotoFile,
  deleteStagingPhoto,
  MAX_PHOTOS_PER_MEMORY,
} from "@/lib/photo-upload";
import { deleteMemoryPhoto } from "@/lib/actions/memories";
import type { PickedPhoto } from "@/components/memories/photo-picker";

/**
 * Drives the "pick photos, upload immediately, show progress" flow shared
 * by the new-memory form and the edit form. Handles three photo
 * situations: a fresh pick (uploads to staging right away), an
 * already-saved photo being removed (deletes it for real), and an
 * in-flight upload removed before it finishes (cleans up the orphan once
 * it lands).
 */
export function usePhotoUploader(userId: string, initialPhotos: PickedPhoto[] = []) {
  const [photos, setPhotos] = useState<PickedPhoto[]>(initialPhotos);
  const uploading = photos.some((p) => p.status === "uploading");

  async function startUpload(photo: PickedPhoto) {
    if (!photo.file) return;
    const result = await uploadPhotoToStaging(userId, photo.file);

    setPhotos((prev) => {
      if (!prev.some((p) => p.id === photo.id)) {
        if ("ok" in result) deleteStagingPhoto(result.photo.path);
        return prev;
      }
      return prev.map((p) => {
        if (p.id !== photo.id) return p;
        if ("error" in result) {
          return { ...p, status: "error", errorMessage: result.error };
        }
        return {
          ...p,
          status: "done",
          storagePath: result.photo.path,
          width: result.photo.width,
          height: result.photo.height,
        };
      });
    });
  }

  function handlePick(fileList: FileList) {
    const remainingSlots = MAX_PHOTOS_PER_MEMORY - photos.length;
    if (remainingSlots <= 0) {
      toast.error(`You can add up to ${MAX_PHOTOS_PER_MEMORY} photos per memory.`);
      return;
    }

    const picked: PickedPhoto[] = [];
    for (const file of Array.from(fileList)) {
      if (picked.length >= remainingSlots) {
        toast.error(`You can add up to ${MAX_PHOTOS_PER_MEMORY} photos per memory.`);
        break;
      }
      const validationError = validatePhotoFile(file);
      if (validationError) {
        toast.error(validationError);
        continue;
      }
      picked.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        status: "uploading",
      });
    }
    if (!picked.length) return;
    setPhotos((prev) => [...prev, ...picked]);
    picked.forEach((p) => startUpload(p));
  }

  async function handleRemove(id: string) {
    const target = photos.find((p) => p.id === id);
    if (!target) return;

    // Already saved to the memory — remove it for real, right away.
    if (target.existingPhotoId && target.storagePath) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      const result = await deleteMemoryPhoto(target.existingPhotoId, target.storagePath);
      if ("error" in result) {
        toast.error(result.error);
        setPhotos((prev) => [...prev, target]);
      }
      return;
    }

    setPhotos((prev) => {
      const t = prev.find((p) => p.id === id);
      // The user may have removed this photo while its upload was still
      // in flight — clean up the now-orphaned file rather than keep it.
      if (t?.status === "done" && t.storagePath) deleteStagingPhoto(t.storagePath);
      if (t?.file) URL.revokeObjectURL(t.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  }

  function handleRetry(id: string) {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "uploading", errorMessage: undefined } : p))
    );
    startUpload(photo);
  }

  /** Freshly uploaded photos not yet linked to a memory in the database. */
  function newlyUploadedPhotos() {
    return photos.filter(
      (p): p is PickedPhoto & { storagePath: string } =>
        p.status === "done" && Boolean(p.storagePath) && !p.existingPhotoId
    );
  }

  return { photos, uploading, handlePick, handleRemove, handleRetry, newlyUploadedPhotos };
}
