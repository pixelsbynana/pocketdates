import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/landing/fade-in";

export function LandingCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <FadeIn className="mx-auto max-w-lg text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Start your pocket-sized archive today
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          It takes two minutes to sign up, and it&apos;s free forever.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            render={<Link href="/signup" />}
            nativeButton={false}
            className="h-12 w-full rounded-full px-8 text-base sm:w-auto"
          >
            Sign up free
          </Button>
          <Button
            render={<Link href="/discover" />}
            nativeButton={false}
            variant="outline"
            className="h-12 w-full rounded-full px-8 text-base sm:w-auto"
          >
            Try a demo first
          </Button>
        </div>
      </FadeIn>
    </section>
  );
}
