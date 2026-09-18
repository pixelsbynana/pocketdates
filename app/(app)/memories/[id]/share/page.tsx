import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMemoryById } from "@/services/memories";
import { ShareSheet } from "@/components/share/share-sheet";

export default async function ShareMemoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/memories/${id}/share`);

  const memory = await getMemoryById(id);
  if (!memory) notFound();

  return <ShareSheet memoryId={memory.id} title={memory.title} />;
}
