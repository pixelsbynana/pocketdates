import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11" priority />
          <span className="font-serif text-lg text-foreground">{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="ghost"
            className="rounded-full"
          >
            Log in
          </Button>
          <Button
            render={<Link href="/signup" />}
            nativeButton={false}
            className="rounded-full"
          >
            Sign up
          </Button>
        </div>
      </div>
    </header>
  );
}
