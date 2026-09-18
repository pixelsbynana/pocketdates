import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMemoriesForCurrentUser } from "@/services/memories";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const [{ data: profile }, { data: preferences }, memories, { data: favorites }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_preferences").select("*").eq("user_id", user.id).maybeSingle(),
      getMemoriesForCurrentUser(),
      supabase.from("favorites").select("created_at, activities(*)").eq("user_id", user.id),
    ]);

  const exportData = {
    exportedAt: new Date().toISOString(),
    account: { email: user.email, createdAt: user.created_at },
    profile,
    preferences,
    memories,
    favorites,
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="pocket-dates-export.json"`,
    },
  });
}
