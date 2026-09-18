import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/landing/fade-in";

export function LandingHero() {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-14 pb-20 sm:px-8 sm:pt-20 sm:pb-28">
      <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <FadeIn>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> 100% free — no subscriptions
          </div>

          <h1 className="mt-5 font-serif text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl">
            Find dates. <br />
            Keep the memories.
          </h1>

          <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
            Pocket Dates helps you and your partner find date ideas, go on
            them together, and turn every one into a little memory you can
            both look back on.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              render={<Link href="/signup" />}
              nativeButton={false}
              className="h-12 rounded-full px-8 text-base"
            >
              Sign up free
            </Button>
            <Button
              render={<Link href="/discover" />}
              nativeButton={false}
              variant="outline"
              className="h-12 rounded-full px-8 text-base"
            >
              Try a demo
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            No credit card. No catches. Just a place for the two of you.
          </p>
        </FadeIn>

        <FadeIn delay={0.15}>
          <HeroMock />
        </FadeIn>
      </div>
    </section>
  );
}

function HeroMock() {
  return (
    <div className="relative mx-auto h-84 w-full max-w-sm sm:h-96">
      <div className="absolute left-2 top-0 w-48 -rotate-6 rounded-3xl border border-border/70 bg-card p-4 shadow-lg sm:left-4 sm:w-56">
        <div className="flex h-28 items-center justify-center rounded-2xl bg-linear-to-br from-beige to-rose/25 text-5xl sm:h-32">
          🌅
        </div>
        <p className="mt-3 font-serif text-base text-foreground">Scenic Sunset Walk</p>
      </div>

      <div className="absolute bottom-0 right-2 w-60 rotate-6 rounded-3xl border border-border/70 bg-card p-4 shadow-lg sm:right-4 sm:w-72">
        <p className="text-sm font-semibold text-primary">15 September, 8:02 pm</p>
        <p className="mt-1 font-serif text-lg text-foreground">Sunset &amp; Bubble Tea</p>
        <p className="mt-2 font-handwritten text-xl leading-snug text-foreground/90">
          Best one yet — we should do this every week 🧋
        </p>
      </div>
    </div>
  );
}
