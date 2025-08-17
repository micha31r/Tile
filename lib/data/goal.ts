"use server"

import { createClient } from "../supabase/server";

export interface Goal {
  id: string;
  name: string;
  details?: string | null;
  created_at: Date;
  completed: boolean;
  reflection?: string | null;
  user_id: string;
}

export async function createGoal(goal: Omit<Goal, 'id' | 'created_at' | 'user_id' | 'completed'>): Promise<Goal | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goal')
    .insert(goal)
    .select('*')
    .single()

  if (error) {
   console.error(`Failed to create goal: ${error.message}`)
   return null;
  }

  return data;
}

export async function getTodayGoals(userId: string, date: Date): Promise<Goal[]> {
  const day = date.toISOString().split('T')[0]

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('goal')
    .select('*')
    .eq('user_id', userId)
    .eq('created_date', day)
    .limit(4)

  if (error) {
    console.error(`Failed to retrieve goals: ${error.message}`)
    return []
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