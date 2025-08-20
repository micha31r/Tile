import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ServerLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (!error && data?.claims) {
    redirect("/app");
  }

  return children;
}
