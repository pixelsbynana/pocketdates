import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMemoryById } from "@/services/memories";
import { ratioDimensions, type ShareRatio, type ShareTemplate } from "@/lib/share-card";
import { MAX_PHOTOS_PER_MEMORY } from "@/lib/constants";
import { formatMemoryDate } from "@/lib/format-date";

export const runtime = "nodejs";

/**
 * Satori (the renderer behind ImageResponse) can't decode WebP — and every
 * photo in Storage is WebP, since that's what the upload pipeline
 * compresses to. Fetch the photo and re-encode it as a JPEG data URI so
 * Satori always gets a format it understands, regardless of source format.
 */
async function toRenderableImage(url: string | null): Promise<string | null> {
  if (!url) return null;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buffer = Buffer.from(await res.arrayBuffer());
    const jpeg = await sharp(buffer)
      .resize({ width: 1400, withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
  } catch (error) {
    console.error("Couldn't prepare share-card photo:", error);
    return null;
  }
}

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

/** The app logo, resized down and inlined as a data URI so Satori (which
 * runs server-side, with no browser to fetch a plain "/logo.png" URL) can
 * render it directly — same reasoning as toRenderableImage above. */
async function loadLogoDataUri(): Promise<string> {
  const buffer = await readFile(LOGO_PATH);
  const png = await sharp(buffer).resize({ width: 160, withoutEnlargement: true }).png().toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

const COLORS = {
  cream: "#F8F3EC",
  beige: "#EDE2D3",
  brown: "#8B6F5A",
  brownDark: "#3D3028",
  rose: "#D9A6A6",
  sage: "#AAB7A0",
  white: "#FFFDFA",
};

const FONT_DIR = path.join(process.cwd(), "lib", "og-fonts");

async function loadFonts() {
  const [serifBold, serifItalic, handwritten, sans, sansBold] = await Promise.all([
    readFile(path.join(FONT_DIR, "Fraunces-Bold.ttf")),
    readFile(path.join(FONT_DIR, "Fraunces-Italic.ttf")),
    readFile(path.join(FONT_DIR, "Caveat-Bold.ttf")),
    readFile(path.join(FONT_DIR, "JakartaSans-Regular.ttf")),
    readFile(path.join(FONT_DIR, "JakartaSans-Bold.ttf")),
  ]);

  return [
    { name: "Fraunces", data: serifBold, weight: 700 as const, style: "normal" as const },
    { name: "Fraunces Italic", data: serifItalic, weight: 500 as const, style: "normal" as const },
    { name: "Caveat", data: handwritten, weight: 700 as const, style: "normal" as const },
    { name: "Jakarta", data: sans, weight: 400 as const, style: "normal" as const },
    { name: "Jakarta Bold", data: sansBold, weight: 700 as const, style: "normal" as const },
  ];
}

interface CardData {
  photoUrl: string | null;
  photoUrls: string[];
  title: string;
  dateLabel: string;
  placeName: string | null;
  quote: string | null;
  width: number;
  height: number;
  logoSrc: string;
}

/**
 * lucide-react's icon components carry a "use client" boundary and can't
 * render inside this server-only route (Satori has no browser to hand
 * that off to), so the MapPin glyph — matching the one on the memory
 * detail page — is hand-copied from lucide's raw path data instead of
 * importing the component.
 */
function MapPinIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Watermark({ dark, logoSrc }: { dark?: boolean; logoSrc: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "Jakarta Bold",
        fontSize: 22,
        color: dark ? COLORS.cream : COLORS.brown,
        letterSpacing: 1,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={logoSrc} alt="" width={40} height={40} style={{ display: "flex" }} />
      Pocket Dates
    </div>
  );
}

function MinimalCard({ photoUrl, title, dateLabel, placeName, width, height, logoSrc }: CardData) {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        backgroundColor: COLORS.brownDark,
        position: "relative",
      }}
    >
      {photoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          width={width}
          height={height}
          style={{ position: "absolute", inset: 0, objectFit: "cover" }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: `linear-gradient(to top, rgba(20,14,8,0.85), rgba(20,14,8,0) 45%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 64,
          right: 64,
          bottom: 64,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Jakarta", fontSize: 28, color: COLORS.cream, opacity: 0.85 }}>
          {dateLabel}
        </div>
        <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 64, color: COLORS.cream, marginTop: 12, lineHeight: 1.1 }}>
          {title}
        </div>
        {placeName && (
          <div style={{ display: "flex", fontFamily: "Jakarta", fontSize: 30, color: COLORS.cream, opacity: 0.85, marginTop: 14 }}>
            {placeName}
          </div>
        )}
        <div style={{ display: "flex", marginTop: 36 }}>
          <Watermark dark logoSrc={logoSrc} />
        </div>
      </div>
    </div>
  );
}

function PolaroidCard({ photoUrl, title, dateLabel, placeName, width, height, logoSrc }: CardData) {
  // Reserve room for the caption block + watermark so short-canvas ratios
  // (square) never push the photo tall enough to clip them.
  const reservedVertical = 300;
  const maxPhotoH = height - reservedVertical;
  const frameW = Math.min(width * 0.82, maxPhotoH / 0.98);
  const photoH = frameW * 0.98;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.beige,
      }}
    >
      <div
        style={{
          width: frameW,
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.white,
          padding: 28,
          boxShadow: "0 30px 60px rgba(61,48,40,0.25)",
        }}
      >
        <div style={{ width: frameW - 56, height: photoH, display: "flex", backgroundColor: COLORS.brown }}>
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt=""
              width={frameW - 56}
              height={photoH}
              style={{ objectFit: "cover" }}
            />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 36, paddingBottom: 12 }}>
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 56, color: COLORS.brownDark }}>
            {title}
          </div>
          <div style={{ display: "flex", fontFamily: "Jakarta", fontSize: 22, color: COLORS.brown, marginTop: 6 }}>
            {[dateLabel, placeName].filter(Boolean).join(" · ")}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", marginTop: 40 }}>
        <Watermark logoSrc={logoSrc} />
      </div>
    </div>
  );
}

function ScrapbookCard({
  photoUrl,
  title,
  dateLabel,
  placeName,
  quote,
  width,
  height,
  logoSrc,
}: CardData) {
  // Normal flex flow (photo -> quote -> watermark, spacer pushes the
  // watermark to the bottom) so this works across all three very
  // different aspect ratios without the photo ever overlapping the text.
  const reservedVertical = 480;
  const maxPhotoH = height - reservedVertical;
  const photoW = Math.min(width * 0.78, maxPhotoH / 1.05);
  const photoH = photoW * 1.05;
  const frameW = photoW + 36; // photo width + the white frame's 18px padding on each side
  const tapeW = 210;
  const tapeH = 68;

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: COLORS.cream,
        padding: 56,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "relative",
          display: "flex",
          marginTop: 56,
          padding: 18,
          backgroundColor: COLORS.white,
          boxShadow: "0 24px 50px rgba(61,48,40,0.18)",
        }}
      >
        <div style={{ width: photoW, height: photoH, display: "flex", backgroundColor: COLORS.brown }}>
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" width={photoW} height={photoH} style={{ objectFit: "cover" }} />
          )}
        </div>

        {/* "Tape" holding the photo down — straddles the top edge like a
            real piece of washi tape, tilted for a hand-placed feel. Comes
            after the photo in the JSX so it paints on top of it. */}
        <div
          style={{
            position: "absolute",
            display: "flex",
            top: -tapeH / 2,
            left: (frameW - tapeW) / 2,
            width: tapeW,
            height: tapeH,
            backgroundColor: COLORS.rose,
            opacity: 0.7,
            transform: "rotate(-5deg)",
            boxShadow: "0 6px 12px rgba(61,48,40,0.12)",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          marginTop: 40,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {quote && (
          <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 42, color: COLORS.brownDark, lineHeight: 1.25, textAlign: "center" }}>
            &ldquo;{quote}&rdquo;
          </div>
        )}
        <div style={{ display: "flex", fontFamily: "Caveat", fontSize: 46, color: COLORS.brown, marginTop: 18 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontFamily: "Jakarta", fontSize: 22, color: COLORS.brown, opacity: 0.8, marginTop: 4 }}>
          {[dateLabel, placeName].filter(Boolean).join(" · ")}
        </div>
      </div>

      <div style={{ display: "flex", marginTop: "auto" }}>
        <Watermark logoSrc={logoSrc} />
      </div>
    </div>
  );
}

function PhotoTile({ url, flex, radius }: { url: string; flex: number; radius: number }) {
  return (
    <div
      style={{
        display: "flex",
        flex,
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor: COLORS.brown,
        boxShadow: "0 16px 30px rgba(61,48,40,0.18)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
}

/** All of a memory's photos (up to MAX_PHOTOS_PER_MEMORY), never cropped
 * out — 1-2 get an equal-width row, 3 gets a hero + row of two, and 4-6
 * fall back to an even grid of rows so nothing is ever hidden. */
function PhotoGrid({ photos }: { photos: string[] }) {
  if (photos.length === 0) return null;

  if (photos.length === 1) {
    return <PhotoTile url={photos[0]} flex={1} radius={36} />;
  }

  if (photos.length === 2) {
    return (
      <div style={{ display: "flex", flex: 1, gap: 18 }}>
        <PhotoTile url={photos[0]} flex={1} radius={32} />
        <PhotoTile url={photos[1]} flex={1} radius={32} />
      </div>
    );
  }

  if (photos.length === 3) {
    return (
      <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18 }}>
        <PhotoTile url={photos[0]} flex={2} radius={36} />
        <div style={{ display: "flex", flex: 1, gap: 18 }}>
          <PhotoTile url={photos[1]} flex={1} radius={28} />
          <PhotoTile url={photos[2]} flex={1} radius={28} />
        </div>
      </div>
    );
  }

  // 4, 5, or 6 photos — an even grid, split into rows of at most 3.
  const rowSizes = photos.length === 4 ? [2, 2] : photos.length === 5 ? [3, 2] : [3, 3];
  const rows: string[][] = [];
  let cursor = 0;
  for (const size of rowSizes) {
    rows.push(photos.slice(cursor, cursor + size));
    cursor += size;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 14 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", flex: 1, gap: 14 }}>
          {row.map((url) => (
            <PhotoTile key={url} url={url} flex={1} radius={22} />
          ))}
        </div>
      ))}
    </div>
  );
}

function JournalCard({
  photoUrls,
  title,
  dateLabel,
  placeName,
  quote,
  width,
  height,
  logoSrc,
}: CardData) {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        padding: 64,
        paddingTop: 104,
        paddingBottom: 140,
        background: `linear-gradient(180deg, ${COLORS.cream} 58%, ${COLORS.rose} 100%)`,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", fontFamily: "Jakarta", fontSize: 38, color: COLORS.brown, opacity: 0.8 }}>
          we went on a date ✨
        </div>
        <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 68, color: COLORS.brownDark, marginTop: 10, lineHeight: 1.05 }}>
          {title}
        </div>
        <div style={{ display: "flex", fontFamily: "Jakarta", fontSize: 30, color: COLORS.brown, opacity: 0.75, marginTop: 14 }}>
          {dateLabel}
        </div>
      </div>

      {/* Photos — capped at roughly two-fifths of the card so there's
          always room left for the note, regardless of photo count. A
          fixed pixel height (rather than flex: 1 filling whatever's left)
          also sidesteps a Satori quirk where percentage-height images
          inside an auto-grown flex parent don't reliably fill it. */}
      <div style={{ display: "flex", flexDirection: "column", height: Math.round(height * 0.42), marginTop: 44 }}>
        <PhotoGrid photos={photoUrls} />
      </div>

      {/* Quote */}
      {quote && (
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 40 }}>
          <div
            style={{
              display: "flex",
              flexShrink: 0,
              fontFamily: "Fraunces",
              fontSize: 68,
              lineHeight: 1,
              color: COLORS.rose,
            }}
          >
            &ldquo;
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "Caveat",
              fontSize: 42,
              color: COLORS.brownDark,
              lineHeight: 1.2,
              marginTop: 14,
            }}
          >
            {quote}
          </div>
        </div>
      )}

      {/* Footer — pinned to the bottom so leftover space (there will
          usually be some, by design) collects above it instead of
          leaving a gap between the quote and the edge of the card. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: 40 }}>
        {placeName ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "Jakarta",
              fontSize: 38,
              color: COLORS.brownDark,
              minWidth: 0,
              flexShrink: 1,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", flexShrink: 0 }}>
              <MapPinIcon size={38} color={COLORS.brownDark} />
            </div>
            <div
              style={{
                display: "flex",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {placeName}
            </div>
          </div>
        ) : (
          <div />
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "Jakarta Bold",
            fontSize: 38,
            color: COLORS.brown,
            flexShrink: 0,
            marginLeft: 24,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} alt="" width={56} height={56} style={{ display: "flex" }} />
          Pocket Dates
        </div>
      </div>
    </div>
  );
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const memoryId = searchParams.get("memoryId");
  const template = (searchParams.get("template") as ShareTemplate) ?? "minimal";
  const ratio = (searchParams.get("ratio") as ShareRatio) ?? "post";

  if (!memoryId) {
    return NextResponse.json({ error: "missing_memory_id" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const memory = await getMemoryById(memoryId);
  if (!memory) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const { width, height } = ratioDimensions(ratio);

  const photoUrls =
    template === "journal"
      ? (
          await Promise.all(
            memory.photos.slice(0, MAX_PHOTOS_PER_MEMORY).map((p) => toRenderableImage(p.url))
          )
        ).filter((url): url is string => Boolean(url))
      : [];
  const photoUrl =
    template === "journal" ? (photoUrls[0] ?? null) : await toRenderableImage(memory.photos[0]?.url ?? null);
  const logoSrc = await loadLogoDataUri();

  const data: CardData = {
    photoUrl,
    photoUrls,
    title: memory.title,
    dateLabel: formatMemoryDate(new Date(memory.completedAt)),
    placeName: memory.placeName,
    quote: memory.notes || null,
    width,
    height,
    logoSrc,
  };

  const fonts = await loadFonts();
  const element =
    template === "journal" ? (
      <JournalCard {...data} />
    ) : template === "polaroid" ? (
      <PolaroidCard {...data} />
    ) : template === "scrapbook" ? (
      <ScrapbookCard {...data} />
    ) : (
      <MinimalCard {...data} />
    );

  return new ImageResponse(element, {
    width,
    height,
    fonts,
  });
}
