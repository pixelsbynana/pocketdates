"use client";

import { useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, RotateCcw, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PickedPhoto {
  id: string;
  /** Absent for photos that already belong to the memory — only freshly
   * picked photos need the original File to upload. */
  file?: File;
  previewUrl: string;
  status: "uploading" | "done" | "error";
  storagePath?: string;
  width?: number | null;
  height?: number | null;
  errorMessage?: string;
  /** Set when this photo is already saved to the memory (its
   * memory_photos.id) — removing it deletes it immediately rather than
   * just clearing a local pick. */
  existingPhotoId?: string;
}

interface PhotoPickerProps {
  photos: PickedPhoto[];
  onPick: (files: FileList) => void;
  onRemove: (id: string) => void | Promise<void>;
  onRetry: (id: string) => void;
  maxPhotos?: number;
}

export function PhotoPicker({ photos, onPick, onRemove, onRetry, maxPhotos }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const atLimit = maxPhotos != null && photos.length >= maxPhotos;

  function handleChange(fileList: FileList | null) {
    if (fileList?.length) onPick(fileList);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        <AnimatePresence initial={false}>
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-square overflow-hidden rounded-2xl bg-muted"
            >
              <Image
                src={photo.previewUrl}
                alt=""
                fill
                className={cn(
                  "object-cover transition-opacity",
                  photo.status === "uploading" && "opacity-50"
                )}
                unoptimized
              />

              {photo.status === "uploading" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <Loader2 className="h-6 w-6 animate-spin text-white drop-shadow" />
                </div>
              )}

              {photo.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/50 p-2 text-center">
                  <p className="text-[11px] leading-tight text-white">Upload failed</p>
                  <button
                    type="button"
                    onClick={() => onRetry(photo.id)}
                    aria-label="Retry upload"
                    className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-medium text-foreground"
                  >
                    <RotateCcw className="h-3 w-3" /> Retry
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => onRemove(photo.id)}
                aria-label="Remove photo"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {!atLimit && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs font-medium">Add photo</span>
          </button>
        )}
      </div>
      {maxPhotos != null && (
        <p className="mt-2 text-xs text-muted-foreground">
          {photos.length}/{maxPhotos} photos
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleChange(e.target.files)}
      />
    </div>
  );
}
