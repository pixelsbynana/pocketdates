import Link from "next/link";
import Image from "next/image";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export function LandingFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={24} height={24} className="h-6 w-6" />
          <div>
            <p className="font-serif text-base text-foreground">{APP_NAME}</p>
            <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
          </div>
        </div>

        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          <Link href="/discover" className="hover:text-foreground">
            Try a demo
          </Link>
          <Link href="/login" className="hover:text-foreground">
            Log in
          </Link>
          <Link href="/signup" className="hover:text-foreground">
            Sign up
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </div>
    </footer>
  );
}
