import { FadeIn } from "@/components/landing/fade-in";
import { PhoneFrame } from "@/components/landing/device-frame";

export function LandingShowcaseMobile() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
            Right there in your pocket
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Browse date ideas on the bus, log a memory on the walk home, or
            scroll back through your shared calendar before bed. Pocket
            Dates is built mobile-first, so the whole experience —
            discovering, logging, and looking back — fits right in your
            hand.
          </p>
        </FadeIn>

        <FadeIn delay={0.1} className="flex justify-center gap-4">
          <div className="w-40 shrink-0 -rotate-3 sm:w-48">
            <PhoneFrame src="/discover-feed.png" alt="The Discover feed in Pocket Dates" />
          </div>
          <div className="mt-8 w-40 shrink-0 rotate-3 sm:w-48">
            <PhoneFrame src="/memories-feed.png" alt="The Memories feed in Pocket Dates" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
