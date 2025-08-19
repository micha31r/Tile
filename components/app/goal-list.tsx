"use client"

import { getGoalsByDate, Goal } from "@/lib/data/goal";
import { CheckIcon, Goal } from "lucide-react";
import { useRealtime } from "../use-realtime";
import { GoalReflectionPopup } from "./goal-reflection-popup";
import { GoalDetailPopup } from "./calendar-cell-popup";

function CompleteIcon() {
  return (
    <div className="flex w-6 aspect-square bg-blue-100 rounded-full">
      <CheckIcon className="w-4 h-4 m-auto text-blue-700" strokeWidth={3} />
    </div>
  )
}

function IncompleteIcon() {
  return (
    <div className="flex w-6 aspect-square border-2 border-border rounded-full">
    </div>
  )
}

export function GoalItem({ goal, priority }: { goal: Goal, priority: number }) {
  return (
    <div className="flex flex-row gap-3 items-center rounded-xl p-3 bg-secondary font-medium">
      <div className="flex justify-center items-center w-6 aspect-square bg-neutral-200 text-muted-foreground rounded-full text-sm">
        {priority}
      </div>
      <h4 className="text-sm line-clamp-1 mr-auto">{goal.name}</h4>
      {goal.completed ? <CompleteIcon /> : <IncompleteIcon />}
    </div>
  )
}

export function GoalList({ userId }: { userId: string }) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startUTC = start.toISOString();

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [goals] = useRealtime<Goal>({
    channelName: 'goal-list',
    schema: 'public',
    table: 'goal',
    filter: `created_at=gte.${startUTC}`,
    getInitialData: async () => {
      return await getGoalsByDate(userId, new Date());
    }
  });

  // Manually filter for lte client-side
  const todayGoals = (goals as Goal[]).filter(goal => {
    const created = new Date(goal.created_at);
    return created <= end;
  });

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Today</h3>
      <div className="space-y-2">
        {todayGoals.map((goal, index) => (
          goal.completed ? (
            <GoalDetailPopup key={index} goal={goal} trigger={() => <GoalItem key={goal.id} priority={goal.priority} goal={goal} />} />
          ) : (
            <GoalReflectionPopup key={index} goal={goal}>
              <GoalItem key={goal.id} priority={goal.priority} goal={goal} />
            </GoalReflectionPopup>
          )
        ))}
      </div>
    </div>
  )
}