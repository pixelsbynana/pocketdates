import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { getFavoritedActivityCards } from "@/lib/actions/favorites";
import { toActivityCard } from "@/lib/recommendations";
import { FavoritesList } from "@/components/favorites/favorites-list";
import { FavoritesHeader } from "@/components/favorites/favorites-header";
import { Button } from "@/components/ui/button";

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-6 pb-10">
        <FavoritesHeader />
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Sign up to start saving date ideas and places.
          </p>
          <Button render={<Link href="/signup" />} nativeButton={false} className="rounded-full">
            Create account
          </Button>
        </div>
      </div>
    );
  }

  const rows = await getFavoritedActivityCards();
  const activities = rows.map((row) => toActivityCard(row, null));

  return (
    <div className="space-y-6 pb-10">
      <FavoritesHeader />
      <FavoritesList initial={activities} />
    </div>
  );
}
