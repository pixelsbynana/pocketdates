import { getCurrentUser } from "@/lib/auth";
import { getInvitePreview } from "@/services/couple";
import { InviteLanding } from "@/components/invite/invite-landing";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const [user, invite] = await Promise.all([getCurrentUser(), getInvitePreview(code)]);

  return (
    <InviteLanding
      code={code}
      isAuthenticated={Boolean(user)}
      inviterFirstName={invite?.inviterFirstName ?? null}
      invalid={!invite}
      expired={Boolean(invite && new Date(invite.expiresAt) < new Date())}
      alreadyAccepted={invite?.status === "accepted"}
    />
  );
}
