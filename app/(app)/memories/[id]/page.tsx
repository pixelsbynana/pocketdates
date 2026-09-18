import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMemoryById } from "@/services/memories";
import { MemoryDetail } from "@/components/memories/memory-detail";

export default async function MemoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/memories/${id}`);

  const memory = await getMemoryById(id);
  if (!memory) notFound();

  return <MemoryDetail memory={memory} />;
}
