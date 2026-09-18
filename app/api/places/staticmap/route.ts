import { NextRequest, NextResponse } from "next/server";

const CENTER_COLOR = "0x8B6F5A"; // brown — "you"
const SPOT_COLOR = "0xD9A6A6"; // rose — nearby spots

function parsePoint(value: string | null): { lat: number; lng: number } | null {
  if (!value) return null;
  const [lat, lng] = value.split(",").map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

/** Proxies a Google Static Map so the API key never reaches the browser.
 * `center` is the user/activity location, `points` is a `;`-separated list
 * of `lat,lng` pairs for the spots being shown alongside it. */
export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const { searchParams } = request.nextUrl;
  const center = parsePoint(searchParams.get("center"));
  const width = Math.min(Number(searchParams.get("w")) || 640, 1280);
  const height = Math.min(Number(searchParams.get("h")) || 320, 640);

  if (!apiKey || !center) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const points = (searchParams.get("points") ?? "")
    .split(";")
    .map(parsePoint)
    .filter((p): p is { lat: number; lng: number } => Boolean(p))
    .slice(0, 10);

  const params = new URLSearchParams({
    size: `${Math.round(width / 2)}x${Math.round(height / 2)}`,
    scale: "2",
    maptype: "roadmap",
    key: apiKey,
  });
  params.append("markers", `size:small|color:${CENTER_COLOR}|${center.lat},${center.lng}`);
  if (points.length) {
    params.append(
      "markers",
      `size:small|color:${SPOT_COLOR}|${points.map((p) => `${p.lat},${p.lng}`).join("|")}`
    );
  } else {
    params.set("center", `${center.lat},${center.lng}`);
    params.set("zoom", "14");
  }

  const upstream = await fetch(
    `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`
  );

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "map_unavailable" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/png",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
