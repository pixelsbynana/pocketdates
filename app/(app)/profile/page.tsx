import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getMemoriesForCurrentUser, computeStats } from "@/services/memories";
import { ProfileView } from "@/components/profile/profile-view";
import { DemoProfileView } from "@/components/profile/demo-profile-view";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return <DemoProfileView />;

  const supabase = await createClient();
  const [{ data: profile }, { data: preferences }, memories, { count: favoritesCount }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      getMemoriesForCurrentUser(),
      supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id),
    ]);

  const coupleId = profile?.couple_id ?? null;
  const [{ data: partner }, { data: pendingInvite }] = coupleId
    ? await Promise.all([
        supabase
          .from("profiles")
          .select("first_name")
          .eq("couple_id", coupleId)
          .neq("id", user.id)
          .maybeSingle(),
        supabase
          .from("couple_invites")
          .select("id")
          .eq("couple_id", coupleId)
          .eq("status", "pending")
          .gt("expires_at", new Date().toISOString())
          .maybeSingle(),
      ])
    : [{ data: null }, { data: null }];

  return (
    <ProfileView
      email={user.email ?? ""}
      firstName={profile?.first_name ?? null}
      partnerName={profile?.partner_name ?? null}
      interests={preferences?.interests ?? []}
      dateStyles={preferences?.date_styles ?? []}
      favoritesCount={favoritesCount ?? 0}
      stats={computeStats(memories)}
      partnerFirstName={partner?.first_name ?? null}
      hasPendingInvite={Boolean(pendingInvite)}
    />
  );
}
