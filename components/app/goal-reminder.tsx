"use client"

import { useRouter } from "next/navigation";
import { Countdown } from "./countdown";
import { RecordGoalPopup } from "./record-goal-popup";
import { getTodayGoals, Goal } from "@/lib/data/goal";
import { useRealtime } from "../use-realtime";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export function GoalReminder() {
  const router = useRouter()
  const [loaded, setLoaded] = useState<boolean>(false)

  const day = new Date().toISOString().split('T')[0];

  const [goals] = useRealtime<Goal>('goal-reminder', 'public', 'goal', `created_date=eq.${day}`, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
      router.push("/auth/login");
      return [];
    }

    const user = data.claims;
    const goalData = await getTodayGoals(user.sub, new Date())
    setLoaded(true);
    return goalData;
  })

  if (!loaded || goals.length >= 4) {
    return null;
  }

  return (
    <div className="space-y-2 p-4 bg-blue-50 rounded-3xl">
      <h4 className="font-medium">Daily goals</h4>
      <p className="text-sm">Don&apos;t forget to set your four daily goals before the timer runs out. Finish all your goals to keep your streak going.</p>
      <div className="flex w-full justify-center p-4 py-4">
        <Countdown target={new Date("2025-08-18T12:00:00")} />
      </div>
      <RecordGoalPopup />
    </div>
  )
}