import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getCurrentUser, getCurrentProfile, getCurrentPreferences } from "@/lib/auth";
import type { OnboardingData } from "@/types/domain";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/onboarding");

  const [profile, preferences] = await Promise.all([
    getCurrentProfile(),
    getCurrentPreferences(),
  ]);

  const initial: OnboardingData = {
    firstName: profile?.first_name ?? "",
    partnerName: profile?.partner_name ?? "",
    interests: preferences?.interests ?? [],
    dateStyles: preferences?.date_styles ?? [],
  };

  return <OnboardingWizard initial={initial} />;
}
