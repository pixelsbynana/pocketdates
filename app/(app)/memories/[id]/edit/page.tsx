import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getMemoryById } from "@/services/memories";
import { MemoryEditForm } from "@/components/memories/memory-edit-form";

export default async function MemoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/memories/${id}/edit`);

  const memory = await getMemoryById(id);
  if (!memory) notFound();

  return <MemoryEditForm memory={memory} userId={user.id} />;
}
