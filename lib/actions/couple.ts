"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "https";
  return process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
}

export async function createCoupleInvite(): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("couple_id")
      .eq("id", user.id)
      .maybeSingle();

    let coupleId = profile?.couple_id ?? null;

    if (coupleId) {
      const { count } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("couple_id", coupleId);
      if ((count ?? 0) >= 2) return { error: "You're already connected with a partner." };
    } else {
      const { data: couple, error: coupleError } = await supabase
        .from("couples")
        .insert({ created_by: user.id })
        .select("id")
        .single();
      if (coupleError) throw coupleError;
      coupleId = couple.id;

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ couple_id: coupleId })
        .eq("id", user.id);
      if (profileError) throw profileError;
    }

    const { data: existing } = await supabase
      .from("couple_invites")
      .select("id")
      .eq("couple_id", coupleId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let inviteId = existing?.id ?? null;
    if (!inviteId) {
      const { data: invite, error: inviteError } = await supabase
        .from("couple_invites")
        .insert({ couple_id: coupleId, created_by: user.id })
        .select("id")
        .single();
      if (inviteError) throw inviteError;
      inviteId = invite.id;
    }

    const origin = await getOrigin();
    revalidatePath("/profile");
    return { url: `${origin}/invite/${inviteId}` };
  } catch (error) {
    console.error("Couldn't create invite:", error);
    return { error: "Couldn't create an invite link — please try again." };
  }
}

export async function acceptCoupleInvite(id: string): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("couple_invites")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!invite) return { error: "That invite link isn't valid." };
  if (invite.created_by === user.id) {
    return { error: "You can't accept your own invite." };
  }

  const { data: myProfile } = await admin
    .from("profiles")
    .select("couple_id")
    .eq("id", user.id)
    .maybeSingle();

  if (myProfile?.couple_id && myProfile.couple_id === invite.couple_id) {
    redirect("/profile");
  }
  if (myProfile?.couple_id) {
    return { error: "You're already connected with a partner." };
  }
  if (invite.status !== "pending") {
    return { error: "This invite has already been used or cancelled." };
  }
  if (new Date(invite.expires_at) < new Date()) {
    return { error: "This invite link has expired — ask your partner to send a new one." };
  }

  const { count: memberCount } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("couple_id", invite.couple_id);
  if ((memberCount ?? 0) >= 2) {
    return { error: "This invite has already been used." };
  }

  try {
    // Backfill first, guarded by "couple_id is null" — safe to re-run this
    // whole action if a later step below fails partway through.
    const { error: backfillError } = await admin
      .from("memories")
      .update({ couple_id: invite.couple_id })
      .is("couple_id", null)
      .in("user_id", [invite.created_by, user.id]);
    if (backfillError) throw backfillError;

    const { error: profileError } = await admin
      .from("profiles")
      .update({ couple_id: invite.couple_id })
      .eq("id", user.id);
    if (profileError) throw profileError;

    const { error: inviteError } = await admin
      .from("couple_invites")
      .update({ status: "accepted", accepted_by: user.id, accepted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "pending");
    if (inviteError) throw inviteError;
  } catch (error) {
    console.error("Couldn't accept invite:", error);
    return { error: "Couldn't connect your accounts — please try again." };
  }

  revalidatePath("/profile");
  revalidatePath("/memories");
  revalidatePath("/calendar");
  redirect("/profile");
}
