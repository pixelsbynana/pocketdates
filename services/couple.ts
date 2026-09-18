import { createAdminClient } from "@/lib/supabase/admin";

export interface InvitePreview {
  status: "pending" | "accepted" | "revoked";
  expiresAt: string;
  inviterFirstName: string | null;
}

/** Public, unauthenticated-safe read of a single invite's display info —
 * needed because the invite landing page must work for a signed-out
 * visitor, whose session can't read a couple_invites row under RLS
 * (select is restricted to the invite's own creator). Bypasses RLS
 * deliberately via the service-role client; returns nothing more
 * sensitive than a first name. */
export async function getInvitePreview(id: string): Promise<InvitePreview | null> {
  const admin = createAdminClient();

  const { data: invite } = await admin
    .from("couple_invites")
    .select("status, expires_at, created_by")
    .eq("id", id)
    .maybeSingle();
  if (!invite) return null;

  const { data: inviter } = await admin
    .from("profiles")
    .select("first_name")
    .eq("id", invite.created_by)
    .maybeSingle();

  return {
    status: invite.status,
    expiresAt: invite.expires_at,
    inviterFirstName: inviter?.first_name ?? null,
  };
}
