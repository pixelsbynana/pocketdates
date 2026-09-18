"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptCoupleInvite } from "@/lib/actions/couple";

interface InviteLandingProps {
  code: string;
  isAuthenticated: boolean;
  inviterFirstName: string | null;
  invalid: boolean;
  expired: boolean;
  alreadyAccepted: boolean;
}

function Shell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-24 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <Heart className="h-5 w-5" />
      </div>
      <p className="font-serif text-xl text-foreground">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      {children}
    </div>
  );
}

export function InviteLanding({
  code,
  isAuthenticated,
  inviterFirstName,
  invalid,
  expired,
  alreadyAccepted,
}: InviteLandingProps) {
  const [accepting, startAccepting] = useTransition();

  if (invalid) {
    return (
      <Shell
        title="That invite link isn't valid"
        description="It may have been revoked, or the link was copied incorrectly."
      >
        <Button
          render={<Link href="/discover" />}
          nativeButton={false}
          className="mt-2 rounded-full"
        >
          Back to Pocket Dates
        </Button>
      </Shell>
    );
  }

  if (expired) {
    return (
      <Shell
        title="This invite link has expired"
        description="Ask your partner to send you a fresh one from their Profile page."
      >
        <Button
          render={<Link href="/discover" />}
          nativeButton={false}
          className="mt-2 rounded-full"
        >
          Back to Pocket Dates
        </Button>
      </Shell>
    );
  }

  if (alreadyAccepted) {
    return (
      <Shell
        title="This invite has already been used"
        description="If you think that's a mistake, ask your partner to send a new invite."
      >
        <Button
          render={<Link href="/discover" />}
          nativeButton={false}
          className="mt-2 rounded-full"
        >
          Back to Pocket Dates
        </Button>
      </Shell>
    );
  }

  if (!isAuthenticated) {
    const next = `/invite/${code}`;
    return (
      <Shell
        title={
          inviterFirstName
            ? `${inviterFirstName} wants to plan dates with you`
            : "You've been invited to Pocket Dates"
        }
        description="Create an account (or log in) to connect and start sharing memories together."
      >
        <div className="mt-2 flex w-full max-w-xs flex-col gap-2">
          <Button
            render={<Link href={`/signup?next=${encodeURIComponent(next)}`} />}
            nativeButton={false}
            size="lg"
            className="w-full rounded-full"
          >
            Create a free account
          </Button>
          <Button
            render={<Link href={`/login?next=${encodeURIComponent(next)}`} />}
            nativeButton={false}
            variant="outline"
            size="lg"
            className="w-full rounded-full"
          >
            I already have an account
          </Button>
        </div>
      </Shell>
    );
  }

  function handleAccept() {
    startAccepting(async () => {
      const result = await acceptCoupleInvite(code);
      if (result && "error" in result) toast.error(result.error);
    });
  }

  return (
    <Shell
      title={
        inviterFirstName
          ? `${inviterFirstName} wants to plan dates with you`
          : "You've been invited to Pocket Dates"
      }
      description="Accepting connects your accounts — you'll both see the same memories, calendar, and photos from here on."
    >
      <Button
        size="lg"
        className="mt-2 w-full max-w-xs rounded-full"
        onClick={handleAccept}
        disabled={accepting}
      >
        {accepting ? "Connecting…" : "Accept invite"}
      </Button>
    </Shell>
  );
}
