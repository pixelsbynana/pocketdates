import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingShowcaseMobile } from "@/components/landing/landing-showcase-mobile";
import { LandingShowcaseDesktop } from "@/components/landing/landing-showcase-desktop";
import { LandingFeatures } from "@/components/landing/landing-features";
import { LandingShowcaseTemplates } from "@/components/landing/landing-showcase-templates";
import { LandingFreeBand } from "@/components/landing/landing-free-band";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingShowcaseMobile />
        <LandingShowcaseDesktop />
        <LandingShowcaseTemplates />
        <LandingFeatures />
        <LandingFreeBand />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  );
}
