import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getActivityById } from "@/services/activities";
import { MemoryNewClient } from "@/components/memories/memory-new-client";

export default async function NewMemoryPage({
  searchParams,
}: {
  searchParams: Promise<{ activityId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/memories/new");

  const { activityId } = await searchParams;

  const isGoogleId = Boolean(activityId?.startsWith("google:"));
  const serverActivity =
    activityId && !isGoogleId ? await getActivityById(activityId, null) : null;

  return (
    <MemoryNewClient
      userId={user.id}
      serverActivity={serverActivity}
      pendingGoogleId={isGoogleId ? activityId! : null}
    />
  );
}
