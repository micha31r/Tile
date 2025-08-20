"use client";

import { getGoalsByDate, Goal } from "@/lib/data/goal";
import { CheckIcon, InfoIcon } from "lucide-react";
import { useRealtime } from "../use-realtime";
import { GoalReflectionPopup } from "./goal-reflection-popup";
import { GoalDetailPopup } from "./calendar-cell-popup";
import { WarningAlert } from "../warning-alert";
import { useContext } from "react";
import { ProfileContext } from "./profile-context";
import { t } from "@/lib/theme";

function CompleteIcon() {
  const { profile: { theme } } = useContext(ProfileContext);

  return (
    <div className={`flex w-6 aspect-square rounded-full ${t("bg", theme, "b", "light")} dark:${t("bg", theme, "f", "dark")}`}>
      <CheckIcon className={`w-4 h-4 m-auto ${t("text", theme, "f")} dark:text-white`} strokeWidth={3} />
    </div>
  );
}

function IncompleteIcon() {
  return (
    <div className="flex w-6 aspect-square border-2 border-border dark:border-neutral-700 rounded-full">
    </div>
  );
}

export function GoalItem({ goal, priority }: { goal: Goal, priority: number }) {
  return (
    <div className="flex flex-row gap-3 items-center rounded-xl p-3 bg-secondary font-medium">
      <div className="flex justify-center items-center w-6 h-6 bg-neutral-200 dark:bg-neutral-700 text-muted-foreground rounded-full text-sm">
        {priority}
      </div>
      <h4 className="flex-1 text-sm line-clamp-1 mr-auto">{goal.name}</h4>
      {goal.completed ? <CompleteIcon /> : <IncompleteIcon />}
    </div>
  );
}

export function GoalList({ userId, emptyMessage }: { userId: string, emptyMessage?: string }) {
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
          <div key={index}>
            {goal.completed ? (
              <GoalDetailPopup goal={goal} trigger={() => <GoalItem key={goal.id} priority={goal.priority} goal={goal} />} />
            ) : (
              <GoalReflectionPopup goal={goal}>
                <GoalItem key={goal.id} priority={goal.priority} goal={goal} />
              </GoalReflectionPopup>
            )}
          </div>
        ))}

        {todayGoals.length === 0 && emptyMessage && (
          <WarningAlert>
            <InfoIcon />
            {emptyMessage}
          </WarningAlert>
        )}
      </div>
    </div>
  );
}