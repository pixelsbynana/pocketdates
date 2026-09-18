"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-[#F8F3EC] px-6 text-center">
        <span className="text-4xl" aria-hidden="true">
          💛
        </span>
        <p className="text-2xl text-[#3D3028]">Something went a little sideways</p>
        <p className="max-w-xs text-sm text-[#8a7a6a]">
          We&apos;re not sure what happened there. Let&apos;s try that again.
        </p>
        <button
          onClick={reset}
          className="mt-2 rounded-full bg-[#8B6F5A] px-5 py-2.5 text-sm font-semibold text-[#F8F3EC]"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
