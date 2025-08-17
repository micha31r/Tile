"use client"

import { useRouter } from "next/navigation";
import { Countdown } from "./countdown";
import { RecordGoalPopup } from "./record-goal-popup";
import { getGoalsByDate, Goal } from "@/lib/data/goal";
import { useRealtime } from "../use-realtime";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { getTodayDateString } from "@/lib/utils";

export function GoalReminder() {
  const router = useRouter()
  const [loaded, setLoaded] = useState<boolean>(false)

  const day = getTodayDateString();

  const [goals] = useRealtime<Goal>({
    channelName: 'goal-reminder',
    schema: 'public',
    table: 'goal',
    filter: `created_date=eq.${day}`,
    getInitialData: async () => {
      const supabase = createClient();

      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) {
        router.push("/auth/login");
        return [];
      }

      const user = data.claims;
      const goalData = await getGoalsByDate(user.sub, day)
      setLoaded(true);
      return goalData;
    }
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
        <p className="text-sm">You cannot set goals before 7am. Try again later.</p>
      </div>
    );
  }

  if (hour >= 9) {
    return (
      <div className="space-y-2 p-4 bg-secondary rounded-3xl">
        <h4 className="font-medium">You are missing {4 - goals.length} goals</h4>
        <p className="text-sm">You cannot set goals outside of the designated time (7am - 9am). Try again tomorrow.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4 bg-blue-50 rounded-3xl">
      <h4 className="font-medium">Daily goals</h4>
      <p className="text-sm">Don&apos;t forget to set your four daily goals before the timer runs out. Finish all your goals to keep your streak going.</p>
      <div className="flex w-full justify-center p-4 py-4">
        <Countdown target={new Date(`${day}T09:00:00`)} />
      </div>
      <RecordGoalPopup />
    </div>
  )
}