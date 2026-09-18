"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateProfileDetails(
  formData: FormData
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  const firstName = String(formData.get("firstName") ?? "").trim();
  const partnerName = String(formData.get("partnerName") ?? "").trim();

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName || null,
      partner_name: partnerName || null,
    })
    .eq("id", user.id);

  if (error) return { error: "Couldn't save your changes — please try again." };

  revalidatePath("/profile");
  return { ok: true };
}

/** Removes every trace of the account: storage files, then the auth user
 * (whose deletion cascades to profiles/preferences/memories/favorites via
 * the FK constraints). Requires the service role key, so it must run
 * server-side only — never expose this action's internals to the client. */
export async function deleteAccount(): Promise<{ error: string } | void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthenticated" };

  try {
    const admin = createAdminClient();

    // memory-photos is nested two levels deep (userId/memoryId/file), so
    // each memory folder needs its own listing — storage.list() isn't
    // recursive.
    const memoryPhotos = admin.storage.from("memory-photos");
    const { data: memoryFolders } = await memoryPhotos.list(user.id, { limit: 1000 });
    for (const folder of memoryFolders ?? []) {
      const { data: files } = await memoryPhotos.list(`${user.id}/${folder.name}`, {
        limit: 1000,
      });
      if (files?.length) {
        await memoryPhotos.remove(
          files.map((f) => `${user.id}/${folder.name}/${f.name}`)
        );
      }
    }

    const avatars = admin.storage.from("avatars");
    const { data: avatarFiles } = await avatars.list(user.id, { limit: 1000 });
    if (avatarFiles?.length) {
      await avatars.remove(avatarFiles.map((f) => `${user.id}/${f.name}`));
    }

    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) throw error;
  } catch (error) {
    console.error("Couldn't delete account:", error);
    return { error: "Couldn't delete your account — please try again or contact support." };
  }

  await supabase.auth.signOut();
  redirect("/");
}
