"use client";

import { startTransition, useEffect, useState } from "react";
import { MemoryForm } from "@/components/memories/memory-form";
import { getCachedActivity } from "@/lib/activity-cache";
import type { ActivityCard } from "@/types/domain";

interface MemoryNewClientProps {
  userId: string;
  serverActivity: ActivityCard | null;
  pendingGoogleId: string | null;
}

export function MemoryNewClient({
  userId,
  serverActivity,
  pendingGoogleId,
}: MemoryNewClientProps) {
  const [activity, setActivity] = useState<ActivityCard | null>(serverActivity);
  const [resolved, setResolved] = useState(!pendingGoogleId);

  useEffect(() => {
    if (!pendingGoogleId) return;
    const cached = getCachedActivity(pendingGoogleId);
    startTransition(() => {
      setActivity(cached);
      setResolved(true);
    });
  }, [pendingGoogleId]);

  if (!resolved) return null;

  return <MemoryForm userId={userId} initialActivity={activity} />;
}
