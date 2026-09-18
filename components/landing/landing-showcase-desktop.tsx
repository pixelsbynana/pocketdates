import { FadeIn } from "@/components/landing/fade-in";
import { BrowserFrame } from "@/components/landing/device-frame";

export function LandingShowcaseDesktop() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <FadeIn className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Looks just as good on the big screen
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Sit down together and scroll back through the month — the same
          shared calendar, laid out clearly on desktop.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12">
        <BrowserFrame
          src="/calendar-desktop.png"
          alt="The shared calendar in Pocket Dates, viewed on desktop"
        />
      </FadeIn>
    </section>
  );
}
