"use server"

import { createClient } from "../supabase/server";

export type GoalPriority = 1 | 2 | 3 | 4;

export interface Goal {
  id: string;
  name: string;
  details?: string | null;
  created_at: Date;
  completed: boolean;
  reflection?: string | null;
  priority: GoalPriority;
  user_id: string;
}

export async function getGoalsByDate(userId: string, date: Date): Promise<Goal[]> {
  const supabase = await createClient()

  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const startUTC = start.toISOString();

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  const endUTC = end.toISOString();

  const { data, error } = await supabase
    .from('goal')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', startUTC)
    .lte('created_at', endUTC)
    .order('priority', { ascending: true })
    .limit(4)

  if (error) {
    console.error(`Failed to retrieve goals: ${error.message}`)
    return []
  }

  return data;
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'user_id' | 'completed' | 'priority'>): Promise<Goal | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error(`User not found`)
    return null
  }

  const goals = await getGoalsByDate(user.id, new Date());

  if (goals.length >= 4) {
    console.error(`Cannot create more than 4 goals for the same date`)
    return null
  }

  const { data, error } = await supabase
    .from('goal')
    .insert({ 
      ...goal,
      priority: goals.length + 1,
    })
    .select('*')
    .single()

  if (error) {
   console.error(`Failed to create goal: ${error.message}`)
   return null;
  }

  return data;
}

export async function markGoalAsCompleted(goalId: string, reflection: string | null): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('goal')
    .update({ completed: true, reflection })
    .eq('id', goalId)

  if (error) {
    console.error(`Failed to mark goal as completed: ${error.message}`)
    return false
  }

  return true
}