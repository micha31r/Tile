import { createFriend } from "@/lib/data/friend";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUserId = searchParams.get("id");
  const code = searchParams.get("code");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  if (targetUserId && code) {
    const success = await createFriend(data.claims.sub, targetUserId, code);
    if (success) {
      redirect(`/app?success=Successfully added friend`);
    } else {
      redirect(`/app/?error=Failed to create friend relationship`);
    }
  }

  redirect(`/app/?error=No user ID or code`);
}
