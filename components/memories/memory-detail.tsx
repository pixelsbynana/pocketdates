"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, MapPin, Pencil, Share, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatMemoryDate } from "@/lib/format-date";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteMemory } from "@/lib/actions/memories";
import type { MemoryWithPhotos } from "@/services/memories";

export function MemoryDetail({ memory }: { memory: MemoryWithPhotos }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const skipBackHistory =
    searchParams.get("new") === "1" || searchParams.get("edited") === "1";
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const date = new Date(memory.completedAt);
  const hasLocation = Boolean(memory.placeName || memory.placeAddress);

  function handleBack() {
    if (skipBackHistory) router.push("/memories");
    else router.back();
  }

  async function handleDelete() {
    setDeleting(true);
    const result = await deleteMemory(memory.id);
    if ("error" in result) {
      toast.error(result.error);
      setDeleting(false);
      return;
    }
    setConfirmOpen(false);
    router.replace("/memories");
    router.refresh();
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between py-2">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="flex gap-2">
          <Button
            render={<Link href={`/memories/${memory.id}/edit`} aria-label="Edit memory" />}
            nativeButton={false}
            variant="outline"
            size="icon"
            className="rounded-full"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full text-destructive"
            aria-label="Delete memory"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {memory.photos.length > 0 ? (
        <div className="-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1 no-scrollbar sm:mx-0 sm:px-0">
          {memory.photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-4/5 w-[85%] shrink-0 snap-center overflow-hidden rounded-3xl bg-muted sm:w-full md:mx-auto md:max-w-md"
            >
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="(min-width: 768px) 450px, 85vw"
                quality={100}
                className="object-cover"
                priority
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-4/3 w-full items-center justify-center rounded-3xl bg-muted text-5xl md:mx-auto md:max-w-md">
          🍂
        </div>
      )}

      <p className="mt-5 text-sm font-semibold text-primary">{formatMemoryDate(date)}</p>
      <h1 className="mt-1 font-serif text-3xl text-foreground">{memory.title}</h1>

      {memory.notes && (
        <p className="mt-4 font-handwritten text-2xl leading-snug text-foreground/90">
          {memory.notes}
        </p>
      )}

      {hasLocation && (
        <div className="mt-5">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4" /> {memory.placeName}
          </p>
          {memory.placeAddress && (
            <p className="mt-0.5 pl-6 text-sm text-muted-foreground">{memory.placeAddress}</p>
          )}
        </div>
      )}

      <Button
        render={<Link href={`/memories/${memory.id}/share`} />}
        nativeButton={false}
        size="lg"
        className="mt-5 w-full rounded-full bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
      >
        <Share className="h-4 w-4" /> Share
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this memory?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &ldquo;{memory.title}&rdquo; and its photos. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
