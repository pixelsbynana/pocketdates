"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Heart, CalendarHeart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, APP_NAME, APP_TAGLINE } from "@/lib/constants";

const ICONS = { Sparkles, Heart, CalendarHeart, User };

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-card/40 px-5 py-8 md:flex">
      <div className="px-2">
        <p className="font-serif text-2xl text-foreground">{APP_NAME}</p>
        <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>

      <ul className="mt-10 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
