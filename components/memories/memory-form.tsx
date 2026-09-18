"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhotoPicker } from "@/components/memories/photo-picker";
import { MemoryCompletion } from "@/components/memories/memory-completion";
import { DateTimePicker } from "@/components/memories/date-time-picker";
import { createMemory, addMemoryPhoto } from "@/lib/actions/memories";
import { MAX_PHOTOS_PER_MEMORY } from "@/lib/photo-upload";
import { MAX_NOTES_LENGTH, MAX_TITLE_LENGTH, MAX_LOCATION_LENGTH } from "@/lib/constants";
import { usePhotoUploader } from "@/hooks/use-photo-uploader";
import type { ActivityCard } from "@/types/domain";

interface MemoryFormProps {
  userId: string;
  initialActivity: ActivityCard | null;
}

export function MemoryForm({ userId, initialActivity }: MemoryFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialActivity?.title ?? "");
  const [notes, setNotes] = useState("");
  const [placeName, setPlaceName] = useState(initialActivity?.placeName ?? "");
  const [completedAt, setCompletedAt] = useState(() => new Date());
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { photos, uploading, handlePick, handleRemove, handleRetry, newlyUploadedPhotos } =
    usePhotoUploader(userId);

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
    setSubmitting(true);

    const result = await createMemory({
      title,
      notes,
      completedAt: completedAt.toISOString(),
      placeName: placeName.trim() || null,
      placeAddress: initialActivity?.placeAddress ?? null,
      latitude: initialActivity?.latitude ?? null,
      longitude: initialActivity?.longitude ?? null,
      activity: initialActivity,
    });

    if ("error" in result) {
      setSubmitting(false);
      toast.error(result.error);
      return;
    }

    const uploaded = newlyUploadedPhotos();
    if (uploaded.length) {
      await Promise.all(
        uploaded.map((p) =>
          addMemoryPhoto(result.id, p.storagePath, p.width ?? null, p.height ?? null)
        )
      );
    }

    setDone(true);
    window.setTimeout(() => {
      router.push(`/memories/${result.id}?new=1`);
    }, 1400);
  }

  if (done) return <MemoryCompletion />;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="font-serif text-2xl text-foreground">How was your date?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Capture the little details while they&apos;re fresh.
          </p>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Sunset walk"
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
        <Label htmlFor="notes">A short note</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="We got bubble tea and watched the sunset…"
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
          <Label htmlFor="placeName">Location (optional)</Label>
          <Input
            id="placeName"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="Richmond Park"
            maxLength={MAX_LOCATION_LENGTH}
          />
        </div>
      </div>

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-full"
        disabled={submitting || uploading}
      >
        {submitting ? "Saving…" : uploading ? "Uploading photos…" : "Save this memory"}
      </Button>
    </form>
  );
}
