import { FadeIn } from "@/components/landing/fade-in";

export function LandingFreeBand() {
  return (
    <section className="bg-accent/50 py-16 sm:py-20">
      <FadeIn className="mx-auto max-w-2xl px-5 text-center sm:px-8">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Completely free. Always.
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          No subscriptions, no paywalls, no ads — Pocket Dates is just a
          little place for the two of you to plan dates and hold onto the
          memories.
        </p>
      </FadeIn>
    </section>
  );
}
