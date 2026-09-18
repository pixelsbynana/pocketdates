/** True for Next's internal "bail out of static rendering" signal — this
 * fires whenever a Server Component reads cookies()/headers() on a route
 * Next is speculatively trying to prerender, and is expected, not a bug. */
export function isDynamicServerError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.includes("DYNAMIC_SERVER_USAGE")
  );
}
