"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoPicker, type PickedPhoto } from "@/components/memories/photo-picker";
import { DateTimePicker } from "@/components/memories/date-time-picker";
import { updateMemory, addMemoryPhoto } from "@/lib/actions/memories";
import { MAX_PHOTOS_PER_MEMORY } from "@/lib/photo-upload";
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH, MAX_LOCATION_LENGTH } from "@/lib/constants";
import { usePhotoUploader } from "@/hooks/use-photo-uploader";
import type { MemoryWithPhotos } from "@/services/memories";

function toPickedPhotos(memory: MemoryWithPhotos): PickedPhoto[] {
  return memory.photos.map((p) => ({
    id: p.id,
    previewUrl: p.url,
    status: "done",
    storagePath: p.storagePath,
    width: p.width,
    height: p.height,
    existingPhotoId: p.id,
  }));
}

export function MemoryEditForm({
  memory,
  userId,
}: {
  memory: MemoryWithPhotos;
  userId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(memory.title);
  const [notes, setNotes] = useState(memory.notes);
  const [placeName, setPlaceName] = useState(memory.placeName ?? "");
  const [completedAt, setCompletedAt] = useState(() => new Date(memory.completedAt));
  const [saving, setSaving] = useState(false);
  const { photos, uploading, handlePick, handleRemove, handleRetry, newlyUploadedPhotos } =
    usePhotoUploader(userId, toPickedPhotos(memory));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Give your memory a title.");
      return;
    }
    if (uploading) {
      toast("Just a moment — your photos are still uploading.");
      return;
    }
    setSaving(true);

    const result = await updateMemory(memory.id, {
      title,
      notes,
      completedAt: completedAt.toISOString(),
      placeName: placeName.trim() || null,
    });

    if ("error" in result) {
      setSaving(false);
      toast.error(result.error);
      return;
    }

    const uploaded = newlyUploadedPhotos();
    if (uploaded.length) {
      await Promise.all(
        uploaded.map((p) =>
          addMemoryPhoto(memory.id, p.storagePath, p.width ?? null, p.height ?? null)
        )
      );
    }

    toast.success("Memory updated");
    router.push(`/memories/${memory.id}?edited=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-2xl text-foreground">Edit memory</h1>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={MAX_TITLE_LENGTH}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label>Photos</Label>
        <PhotoPicker
          photos={photos}
          onPick={handlePick}
          onRemove={handleRemove}
          onRetry={handleRetry}
          maxPhotos={MAX_PHOTOS_PER_MEMORY}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Note</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          maxLength={MAX_NOTES_LENGTH}
        />
        <p className="text-right text-xs text-muted-foreground">
          {notes.length}/{MAX_NOTES_LENGTH}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Date &amp; time</Label>
          <DateTimePicker value={completedAt} onChange={setCompletedAt} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="placeName">Location</Label>
          <Input
            id="placeName"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            maxLength={MAX_LOCATION_LENGTH}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full"
        disabled={saving || uploading}
      >
        {saving ? "Saving…" : uploading ? "Uploading photos…" : "Save changes"}
      </Button>
    </form>
  );
}
