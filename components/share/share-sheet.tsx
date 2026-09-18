"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, Share } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SHARE_RATIOS, SHARE_TEMPLATES, type ShareRatio, type ShareTemplate } from "@/lib/share-card";

export function ShareSheet({ memoryId, title }: { memoryId: string; title: string }) {
  const router = useRouter();
  const [template, setTemplate] = useState<ShareTemplate>("journal");
  const [ratio, setRatio] = useState<ShareRatio>("story");
  const [busy, setBusy] = useState(false);

  const imageUrl = useMemo(
    () => `/api/share-card?memoryId=${memoryId}&template=${template}&ratio=${ratio}`,
    [memoryId, template, ratio]
  );

  const previewRatio = SHARE_RATIOS.find((r) => r.value === ratio)!;

  async function fetchImageBlob() {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error("Couldn't generate image");
    return res.blob();
  }

  async function handleDownload() {
    setBusy(true);
    try {
      const blob = await fetchImageBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pocket-dates-${title.toLowerCase().replace(/\s+/g, "-")}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Couldn't create that image — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleShare() {
    setBusy(true);
    try {
      const blob = await fetchImageBlob();
      const file = new File([blob], "pocket-dates.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Pocket Dates",
          text: title,
        });
      } else {
        await handleDownload();
      }
    } catch (error) {
      if ((error as Error)?.name !== "AbortError") {
        toast.error("Couldn't share that image — please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-2xl text-foreground">Share memory</h1>
      </div>

      <div
        className="mx-auto overflow-hidden rounded-3xl border border-border/70 bg-muted shadow-sm"
        style={{
          width: "100%",
          maxWidth: 320,
          aspectRatio: `${previewRatio.width} / ${previewRatio.height}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={imageUrl}
          src={imageUrl}
          alt="Share card preview"
          className="h-full w-full object-cover"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Template</p>
        <div className="flex gap-2">
          {SHARE_TEMPLATES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTemplate(t.value)}
              className={cn(
                "flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                template === t.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">Format</p>
        <div className="flex gap-2">
          {SHARE_RATIOS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRatio(r.value)}
              className={cn(
                "flex-1 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                ratio === r.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Button
          size="lg"
          className="w-full rounded-full"
          onClick={handleShare}
          disabled={busy}
        >
          <Share className="h-4 w-4" /> Share
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full rounded-full"
          onClick={handleDownload}
          disabled={busy}
        >
          <Download className="h-4 w-4" /> Download
        </Button>
      </div>
    </div>
  );
}
