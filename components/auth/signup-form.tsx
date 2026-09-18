"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithEmail } from "@/lib/actions/auth";

export function SignupForm({ next, loginHref }: { next: string; loginHref: string }) {
  const [error, setError] = useState<string | null>(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setAlreadyExists(false);
    startTransition(async () => {
      const result = await signUpWithEmail(formData);
      if (result && "error" in result) setError(result.error);
      else if (result && "alreadyExists" in result) setAlreadyExists(true);
      else if (result && "needsEmailConfirmation" in result) setNeedsConfirmation(true);
    });
  }

  if (needsConfirmation) {
    return (
      <div className="space-y-3 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Mail className="h-6 w-6" />
        </div>
        <p className="font-serif text-xl text-foreground">Check your inbox</p>
        <p className="text-sm text-muted-foreground">
          We sent you a confirmation link. Click it to finish creating your account.
        </p>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      <div className="space-y-1.5">
        <Label htmlFor="firstName">Your first name</Label>
        <Input id="firstName" name="firstName" type="text" autoComplete="given-name" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>

      {alreadyExists && (
        <p role="alert" className="text-sm text-destructive">
          You already have an account.{" "}
          <Link href={loginHref} className="font-semibold underline">
            Please sign in
          </Link>
        </p>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full rounded-full" disabled={pending}>
        {pending ? "Creating your account…" : "Create account"}
      </Button>
    </form>
  );
}
