import Link from "next/link";
import Image from "next/image";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 py-10">
      <Link href="/" className="mb-8 flex flex-col items-center gap-1 text-center">
        <Image src="/logo.png" alt="" width={72} height={72} className="h-18 w-18" />
        <span className="font-serif text-2xl text-foreground">{APP_NAME}</span>
        <span className="text-sm text-muted-foreground">{APP_TAGLINE}</span>
      </Link>
      <div className="w-full max-w-sm rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        {children}
      </div>
    </div>
  );
}
