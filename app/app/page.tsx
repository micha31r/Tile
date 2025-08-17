import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GoalList } from "@/components/app/goal-list";
import { GoalReminder } from "@/components/app/goal-reminder";
import { StatusMessagePopup } from "@/components/app/status-message-popup";
import { FriendListPopup } from "@/components/app/friend-list-popup";
import { CalendarClientWrapper } from "@/components/app/calendar-client-wrapper";
import { FriendActivities } from "@/components/app/friend-activities";

export default async function AppHomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">
      <StatusMessagePopup />
      <GoalReminder />
      <GoalList />
      <CalendarClientWrapper />
      <FriendActivities />
    </div>
  );
}
