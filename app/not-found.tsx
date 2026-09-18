import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
      <span className="text-4xl" aria-hidden="true">
        🍂
      </span>
      <p className="font-serif text-2xl text-foreground">We couldn&apos;t find that page</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        It might have moved, or never existed in the first place.
      </p>
      <Link
        href="/discover"
        className="mt-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
      >
        Back to Discover
      </Link>
    </div>
  );
}
