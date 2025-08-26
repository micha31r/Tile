"use client";

import { Countdown } from "./countdown";
import { RecordGoalPopup } from "./record-goal-popup";
import { filterGoalsByTimeRange, Goal } from "@/lib/data/goal";
import { useRealtime } from "../use-realtime";
import { useContext, useState } from "react";
import { cn, getTodayRangeAsUTC } from "@/lib/utils";
import { t } from "@/lib/theme";
import { ProfileContext } from "./profile-context";

export function GoalReminder() {
  const { profile: { theme }, userId } = useContext(ProfileContext);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [startUTC, endUTC] = getTodayRangeAsUTC();

  const [goals] = useRealtime<Goal>({
    channelName: 'goal-reminder',
    schema: 'public',
    table: 'goal',
    filter: `created_at=gte.${startUTC}`,
    getInitialData: async () => {
      const goalData = await filterGoalsByTimeRange(userId, startUTC, endUTC);
      setLoaded(true);
      return goalData;
    }
  });

  // Manually filter for lte client-side
  const todayGoals = (goals as Goal[]).filter(goal => {
    const created = new Date(goal.created_at);
    return created <= new Date(endUTC);
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
        <p className="text-sm">You can only set goals between 7 am - 11 am. Please come back later.</p>
      </div>
    );
  }

  if (hour >= 11) {
    return (
      <div className="space-y-2 p-4 bg-secondary rounded-3xl">
        <h4 className="font-medium">You are missing {4 - todayGoals.length} goals</h4>
        <p className="text-sm">To restart your streak, make sure to set 4 goals tomorrow before 11 am.</p>
      </div>
    );
  }

  const timerTarget = new Date();
  timerTarget.setHours(11, 0, 0, 0);

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