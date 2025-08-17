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