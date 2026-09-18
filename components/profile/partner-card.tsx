"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createCoupleInvite } from "@/lib/actions/couple";

interface PartnerCardProps {
  partnerFirstName: string | null;
  hasPendingInvite: boolean;
}

export function PartnerCard({ partnerFirstName, hasPendingInvite }: PartnerCardProps) {
  const [sharing, startSharing] = useTransition();

  function handleInvite() {
    startSharing(async () => {
      const result = await createCoupleInvite();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      if (navigator.share) {
        try {
          await navigator.share({ title: "Join me on Pocket Dates", url: result.url });
        } catch {
          // user cancelled the share sheet — not an error
        }
      } else {
        await navigator.clipboard.writeText(result.url);
        toast.success("Invite link copied!");
      }
    });
  }

  if (partnerFirstName) {
    return (
      <div className="flex items-center gap-4 rounded-3xl border border-border/70 bg-card p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-lg text-accent-foreground">
          {partnerFirstName[0]?.toUpperCase()}
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">Connected with {partnerFirstName} 💛</p>
          <p className="text-sm text-muted-foreground">
            You&apos;re sharing memories, photos, and your calendar together.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border/70 bg-card p-5">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <UserPlus className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">
            {hasPendingInvite ? "Invite sent" : "Invite your partner"}
          </p>
          <p className="text-sm text-muted-foreground">
            {hasPendingInvite
              ? "Waiting for them to accept — you can share the link again below."
              : "Share a link so they can see and add memories with you."}
          </p>
        </div>
      </div>
      <Button
        size="sm"
        variant="secondary"
        className="mt-4 w-full rounded-full"
        onClick={handleInvite}
        disabled={sharing}
      >
        {sharing ? "Creating link…" : hasPendingInvite ? "Share again" : "Invite partner"}
      </Button>
    </div>
  );
}
