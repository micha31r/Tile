import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarMonth } from "@/components/app/calendar-month";

export default async function AppHomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* <h3 className="font-medium">Aug</h3> */}
      <CalendarMonth month={10} year={2025} showLabel={true} />
    </div>
  );
}
