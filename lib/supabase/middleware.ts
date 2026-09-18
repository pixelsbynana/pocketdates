import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

// Bare list/overview pages (/memories, /calendar, /profile) render a demo
// view for signed-out visitors, so only routes with no demo equivalent —
// a specific memory, editing, or creating one — actually require a
// session. Sub-routes always have a trailing "/", so this never matches
// the bare list pages themselves.
const PROTECTED_PREFIXES = ["/memories/", "/onboarding"];

// Routes a signed-in-but-not-yet-onboarded user is still allowed to reach.
// Everything else redirects them to /onboarding first — this is the real
// safety net for "did this user finish onboarding," since the redirect
// chain from signup (email confirmation -> /auth/callback?next=/onboarding)
// isn't guaranteed to survive every email client/link-scanner untouched.
const ONBOARDING_EXEMPT_PREFIXES = [
  "/onboarding",
  "/invite",
  "/api",
  "/auth",
  "/login",
  "/signup",
  "/reset-password",
  "/update-password",
];

/**
 * Refreshes the Supabase auth session on every request and redirects
 * unauthenticated users away from routes that require an account.
 * Demo/browse routes (/, /discover, activity detail) stay public.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    path.startsWith(prefix)
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && isProtected) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", path);
      return NextResponse.redirect(redirectUrl);
    }

    if (user && !ONBOARDING_EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      const { data: prefs } = await supabase
        .from("user_preferences")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!prefs) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/onboarding";
        redirectUrl.search = "";
        return NextResponse.redirect(redirectUrl);
      }
    }
  } catch {
    // Supabase unreachable — this is only an optimistic UX redirect, not
    // the real security boundary (RLS + page-level checks are), so fail
    // open rather than breaking the whole app on a transient network blip.
  }

  return supabaseResponse;
}
