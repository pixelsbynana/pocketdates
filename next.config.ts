import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next 16 only allows quality 75 unless explicitly allowlisted — 100
    // is used for memory photos so they render at full upload quality.
    qualities: [75, 100],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/**" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    // Setting localPatterns at all makes Next 16 block every local image
    // path that doesn't match an entry (not just ones with query strings),
    // so every local <Image src> used anywhere in the app needs one:
    // the Google Places photo/map proxies (query-string paths), and any
    // static asset under /public (logo, landing-page screenshots, etc).
    localPatterns: [
      { pathname: "/api/places/photo" },
      { pathname: "/api/places/staticmap" },
      { pathname: "/*.png" },
      { pathname: "/*.jpg" },
    ],
  },
};

export default nextConfig;
