"use client"

import { Goal } from "@/lib/data/goal";
import { createClient } from "@/lib/supabase/client";
import { CheckIcon } from "lucide-react";
import { useRealtime } from "../use-realtime";
import { GoalDetailPopup } from "./goal-detail-popup";

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

function GoalItem({ goal, priority }: { goal: Goal, priority: number }) {
  return (
    <GoalDetailPopup goal={goal}>
      <div className="flex flex-row gap-3 items-center rounded-xl p-3 bg-secondary font-medium">
        <div className="flex justify-center items-center w-6 aspect-square bg-neutral-200 text-muted-foreground rounded-full text-sm">
          {priority}
        </div>
        <h4 className="text-sm line-clamp-1 mr-auto">{goal.name}</h4>
        {goal.completed ? <CompleteIcon /> : <IncompleteIcon />}
      </div>
    </GoalDetailPopup>
  )
}

export function GoalList() {
  const [goals] = useRealtime<Goal>('public', 'goal', undefined, async () => {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('goal')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }
    
    return data;
  })


  return (
    <div className="space-y-4">
        <h3 className="font-medium">Today</h3>

        <div className="space-y-2">
          {(goals as Goal[]).map((goal, index) => (
            <GoalItem key={goal.id} priority={index + 1} goal={goal} />
          ))}
      </div>
    </div>
  )
}