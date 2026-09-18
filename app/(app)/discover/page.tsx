import { DiscoverClient } from "@/components/discover/discover-client";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth";
import { getSeedActivities, getRecommendationContext, demoRecommendationContext } from "@/services/activities";
import { createClient } from "@/lib/supabase/server";
import { DEMO_PROFILE } from "@/lib/demo-data";

export default async function DiscoverPage() {
  const user = await getCurrentUser();
  const seedActivities = await getSeedActivities(null);

  if (!user) {
    return (
      <DiscoverClient
        seedActivities={seedActivities}
        recommendationContext={demoRecommendationContext(null)}
        firstName={DEMO_PROFILE.firstName}
        isAuthenticated={false}
        isDemo={true}
        initialFavoritedIds={[]}
      />
    );
  }

  const [profile, context] = await Promise.all([
    getCurrentProfile(),
    getRecommendationContext(user.id, null),
  ]);

  const supabase = await createClient();
  const { data: favorites } = await supabase
    .from("favorites")
    .select("activity_id")
    .eq("user_id", user.id);

  return (
    <DiscoverClient
      seedActivities={seedActivities}
      recommendationContext={context}
      firstName={profile?.first_name ?? null}
      isAuthenticated={true}
      isDemo={false}
      initialFavoritedIds={(favorites ?? []).map((f) => f.activity_id)}
    />
  );
}
