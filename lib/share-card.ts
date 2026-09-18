export type ShareTemplate = "minimal" | "polaroid" | "scrapbook" | "journal";
export type ShareRatio = "story" | "post" | "square";

export const SHARE_TEMPLATES: { value: ShareTemplate; label: string }[] = [
  { value: "journal", label: "Journal" },
  { value: "minimal", label: "Minimal" },
  { value: "polaroid", label: "Polaroid" },
  { value: "scrapbook", label: "Scrapbook" },
];

export const SHARE_RATIOS: { value: ShareRatio; label: string; width: number; height: number }[] = [
  { value: "story", label: "Story", width: 1080, height: 1920 },
  { value: "post", label: "Post", width: 1080, height: 1350 },
  { value: "square", label: "Square", width: 1080, height: 1080 },
];

export function ratioDimensions(ratio: ShareRatio) {
  const found = SHARE_RATIOS.find((r) => r.value === ratio) ?? SHARE_RATIOS[1];
  return { width: found.width, height: found.height };
}
