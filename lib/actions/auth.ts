"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getOrigin() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const protocol = h.get("x-forwarded-proto") ?? "https";
  return process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
}

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email or password doesn't look right.";
  if (m.includes("already registered") || m.includes("already exists"))
    return "An account with that email already exists — try logging in instead.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email before logging in — check your inbox.";
  if (m.includes("password"))
    return "Password must be at least 8 characters.";
  if (m.includes("rate limit"))
    return "That's a lot of attempts — please wait a moment and try again.";
  if (m.includes("fetch failed") || m.includes("network"))
    return "We couldn't reach the server. Check your connection and try again.";
  return "Something went wrong. Please try again in a moment.";
}

export async function signUpWithEmail(
  formData: FormData
): Promise<
  | { error: string }
  | { alreadyExists: true }
  | { needsEmailConfirmation: true }
  | void
> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const next = String(formData.get("next") || "/onboarding");

  if (!email || !password) {
    return { error: "Please fill in your email and password." };
  }
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: firstName ? { first_name: firstName } : undefined,
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    const m = error.message.toLowerCase();
    if (m.includes("already registered") || m.includes("already exists")) {
      return { alreadyExists: true };
    }
    return { error: friendlyAuthError(error.message) };
  }

  // Supabase returns a user with no identities (and no error) when the
  // email is already registered — this is intentional, to avoid leaking
  // which emails have accounts.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { alreadyExists: true };
  }

  if (!data.session) return { needsEmailConfirmation: true };

  redirect(next);
}

export async function signInWithEmail(
  formData: FormData
): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") || "/discover");

  if (!email || !password) {
    return { error: "Please fill in your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: friendlyAuthError(error.message) };

  redirect(next);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(
  formData: FormData
): Promise<{ error: string } | { sent: true }> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) return { error: "Enter your email address." };

  const supabase = await createClient();
  const origin = await getOrigin();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/update-password")}`,
  });

  if (error) return { error: friendlyAuthError(error.message) };
  return { sent: true };
}

export async function updatePassword(
  formData: FormData
): Promise<{ error: string } | void> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendlyAuthError(error.message) };

  redirect("/discover");
}
