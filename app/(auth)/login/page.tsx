import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next: rawNext, error } = await searchParams;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-foreground">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in to pick up where you left off.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <LoginForm next={rawNext ?? "/discover"} />

      <p className="text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(rawNext ?? "/onboarding")}`}
          className="font-semibold text-primary"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
