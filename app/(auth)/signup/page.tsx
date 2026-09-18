import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const loginHref = `/login?next=${encodeURIComponent(rawNext ?? "/discover")}`;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-2xl text-foreground">Start your archive</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A little corner of the internet that belongs to the two of you.
        </p>
      </div>

      <SignupForm next={rawNext ?? "/onboarding"} loginHref={loginHref} />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={loginHref} className="font-semibold text-primary">
          Log in
        </Link>
      </p>
    </div>
  );
}
