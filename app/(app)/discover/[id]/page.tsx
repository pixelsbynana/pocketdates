import { notFound } from "next/navigation";
import { ActivityDetail } from "@/components/discover/activity-detail";
import { GooglePlaceDetailClient } from "@/components/discover/google-place-detail-client";
import { getActivityById } from "@/services/activities";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (id.startsWith("google:")) {
    return <GooglePlaceDetailClient id={id} isAuthenticated={Boolean(user)} />;
  }

  const activity = await getActivityById(id, null);
  if (!activity) notFound();

  let initiallyFavorited = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("activity_id", activity.id)
      .maybeSingle();
    initiallyFavorited = Boolean(data);
  }

  return (
    <ActivityDetail
      activity={activity}
      isAuthenticated={Boolean(user)}
      initiallyFavorited={initiallyFavorited}
    />
  );
}
