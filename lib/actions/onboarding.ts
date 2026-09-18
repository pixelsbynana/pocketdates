"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingData } from "@/types/domain";

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/onboarding");

  await supabase.from("profiles").upsert({
    id: user.id,
    first_name: data.firstName || null,
    partner_name: data.partnerName || null,
  });

  await supabase.from("user_preferences").upsert({
    user_id: user.id,
    interests: data.interests,
    date_styles: data.dateStyles,
  });

  redirect("/discover");
}
