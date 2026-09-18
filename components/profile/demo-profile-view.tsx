import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEMO_PROFILE, DEMO_PREFERENCES } from "@/lib/demo-data";
import { DATE_STYLE_OPTIONS, INTEREST_OPTIONS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export function DemoProfileView() {
  return (
    <div className="space-y-6 pb-10">
      <h1 className="font-serif text-2xl text-foreground">Profile</h1>

      <div className="rounded-2xl border border-dashed border-primary/40 bg-secondary/50 px-4 py-2.5 text-center text-xs font-medium text-primary">
        You&apos;re viewing a sample profile —{" "}
        <Link href="/signup" className="underline">
          sign up
        </Link>{" "}
        to make it yours.
      </div>

      <div className="rounded-3xl border border-border/70 bg-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent font-serif text-xl text-accent-foreground">
            {DEMO_PROFILE.firstName[0]}
            {DEMO_PROFILE.partnerName[0]}
          </div>
          <div>
            <p className="font-serif text-xl text-foreground">
              {DEMO_PROFILE.firstName} & {DEMO_PROFILE.partnerName}
            </p>
            <p className="text-sm text-muted-foreground">demo@pocketdates.app</p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-border/70 bg-card p-5">
        <p className="font-medium text-foreground">What we enjoy</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DEMO_PREFERENCES.interests.map((i) => {
            const opt = INTEREST_OPTIONS.find((o) => o.value === i);
            return (
              <Badge key={i} variant="secondary" className="rounded-full">
                {opt?.emoji} {opt?.label}
              </Badge>
            );
          })}
          {DEMO_PREFERENCES.dateStyles.map((d) => {
            const opt = DATE_STYLE_OPTIONS.find((o) => o.value === d);
            return (
              <Badge key={d} variant="secondary" className="rounded-full">
                {opt?.emoji} {opt?.label}
              </Badge>
            );
          })}
        </div>
      </div>

      <Button render={<Link href="/signup" />} nativeButton={false} size="lg" className="w-full rounded-full">
        Create your account
      </Button>
    </div>
  );
}
