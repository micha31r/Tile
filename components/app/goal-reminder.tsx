"use client";

import { useRouter } from "next/navigation";
import { Countdown } from "./countdown";
import { RecordGoalPopup } from "./record-goal-popup";
import { getGoalsByDate, Goal } from "@/lib/data/goal";
import { useRealtime } from "../use-realtime";
import { createClient } from "@/lib/supabase/client";
import { useContext, useState } from "react";
import { cn } from "@/lib/utils";
import { t } from "@/lib/theme";
import { ProfileContext } from "./profile-context";

export function GoalReminder() {
  const { profile: { theme } } = useContext(ProfileContext);
  const router = useRouter();
  const [loaded, setLoaded] = useState<boolean>(false);

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startUTC = start.toISOString();

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [goals] = useRealtime<Goal>({
    channelName: 'goal-reminder',
    schema: 'public',
    table: 'goal',
    filter: `created_at=gte.${startUTC}`,
    getInitialData: async () => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) {
        router.push("/auth/login");
        return [];
      }

      const user = data.claims;
      const goalData = await getGoalsByDate(user.sub, new Date());
      setLoaded(true);
      return goalData;
    }
  });

  // Manually filter for lte client-side
  const todayGoals = (goals as Goal[]).filter(goal => {
    const created = new Date(goal.created_at);
    return created <= end;
  });

  if (!loaded) {
    return <div className="h-28 animate-pulse space-y-2 p-4 bg-secondary rounded-3xl"></div>;
  }

  if (goals.length >= 4) {
    return (
      <div className="space-y-2 p-4 bg-secondary rounded-3xl">
        <h4 className="font-medium">All set!</h4>
        <p className="text-sm">Check off all 4 goals before 11:59pm today to earn your daily streak.</p>
      </div>
    );
  }
  
  const now = new Date();
  const hour = now.getHours();

  if (hour < 7) {
    return (
      <div className="space-y-2 p-4 bg-secondary rounded-3xl">
        <h4 className="font-medium">Snoozing</h4>
        <p className="text-sm">You can only set goals between 7 am - 10 am. Try again later.</p>
      </div>
    );
  }

  if (hour >= 10) {
    return (
      <div className="space-y-2 p-4 bg-secondary rounded-3xl">
        <h4 className="font-medium">You are missing {4 - todayGoals.length} goals</h4>
        <p className="text-sm">To restart your streak, make sure to set 4 goals tomorrow before 10 am.</p>
      </div>
    );
  }

  const timerTarget = new Date();
  timerTarget.setHours(10, 0, 0, 0);

  return (
    <div className={cn("space-y-2 p-4 rounded-3xl", t("bg", theme, "b"))}>
      <h4 className="font-medium">Daily goals</h4>
      <p className="text-sm">Don&apos;t forget to set your four daily goals before the timer runs out. Finish all your goals to keep your streak going.</p>
      <div className="flex w-full justify-center p-4 py-4">
        <Countdown target={timerTarget} />
      </div>
      <div>
        <RecordGoalPopup />
      </div>
    </div>
  );
}