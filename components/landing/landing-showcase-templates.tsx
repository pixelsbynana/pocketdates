import Image from "next/image";
import { FadeIn } from "@/components/landing/fade-in";

const TEMPLATES = [
  { src: "/format-journal.png", label: "Journal" },
  { src: "/format-minimal.png", label: "Minimal" },
  { src: "/format-polaroid.png", label: "Polaroid" },
  { src: "/format-scrapbook.png", label: "Scrapbook" },
];

export function LandingShowcaseTemplates() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
      <FadeIn className="mx-auto max-w-xl text-center">
        <h2 className="font-serif text-3xl text-foreground sm:text-4xl">
          Share the memory, not just the photo
        </h2>
        <p className="mt-3 text-lg text-muted-foreground">
          Turn any memory into a beautiful card ready to share on social media — pick
          from four styles, made in one tap.
        </p>
      </FadeIn>

      <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {TEMPLATES.map((t, i) => (
          <FadeIn key={t.src} delay={i * 0.06} className="flex flex-col items-center gap-3">
            <div className="w-full overflow-hidden rounded-2xl border-8 border-white shadow-xl">
              <div className="relative aspect-9/16 w-full bg-muted">
                <Image
                  src={t.src}
                  alt={`The ${t.label} share card template`}
                  fill
                  sizes="(min-width: 768px) 220px, 45vw"
                  className="object-cover"
                />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{t.label}</p>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
