import { FadeIn } from "@/components/landing/fade-in";

const FEATURES = [
  {
    emoji: "🧋",
    title: "Find your next date in seconds",
    description:
      "Filter by how much time you have and how far you want to go, or just tap \"Surprise us\" and let Pocket Dates pick something lovely for you.",
  },
  {
    emoji: "📸",
    title: "Turn dates into memories",
    description:
      "Log photos, a little note, and where you went. Every memory lands in your feed and on a shared calendar you can scroll back through anytime.",
  },
  {
    emoji: "💛",
    title: "Share it with your partner",
    description:
      "Invite your partner to their own account and you'll both see the same memories, calendar, and photos — add or edit from either side.",
  },
  {
    emoji: "✨",
    title: "Turn a memory into a keepsake",
    description:
      "Pick a memory and turn it into a beautiful card in one tap, ready to share on social media or save for yourselves.",
  },
];

export function LandingFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <FadeIn className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          From &ldquo;what should we do?&rdquo; to a memory worth keeping
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Pocket Dates covers the whole loop — finding a date idea, going on it,
          and holding onto how it went — so nothing gets lost in your camera roll.
        </p>
      </FadeIn>

      <div className="mt-14 grid gap-6 sm:grid-cols-2">
        {FEATURES.map((feature, i) => (
          <FadeIn key={feature.title} delay={i * 0.08}>
            <div className="h-full rounded-3xl border border-border/70 bg-card p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-2xl">
                {feature.emoji}
              </div>
              <h3 className="mt-4 font-serif text-xl text-foreground">{feature.title}</h3>
              <p className="mt-2 text-base leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
