import { NextRequest, NextResponse } from "next/server";

/** Proxies a Google Places photo so the API key never reaches the browser. */
export async function GET(request: NextRequest) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const name = request.nextUrl.searchParams.get("name");

  if (!apiKey || !name || !name.startsWith("places/")) {
    return NextResponse.json({ error: "invalid_request" }, { status: 400 });
  }

  const upstream = await fetch(
    `https://places.googleapis.com/v1/${name}/media?maxWidthPx=1000&key=${apiKey}`,
    { redirect: "follow" }
  );

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "photo_unavailable" }, { status: 502 });
  }

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
