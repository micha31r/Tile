"use server"

import { dangerCreateServerRoleClient } from "../supabase/server-role";
import { getFriendsWithUser } from "./friend";
import { getGoalsByDate } from "./goal";
import { Profile } from "./profile";

export interface BroadcastPayload {
  completed_goals: Array<number>;
}

// Future TODO: add broadcast type as field
export interface Broadcast {
  user_id: string;
  payload: BroadcastPayload;
  created_at: Date;
}

export interface BroadcastWithUser extends Profile, Broadcast {
  email: string;
}

export async function createBroadcast(userId: string, payload: BroadcastPayload): Promise<Broadcast | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from("broadcast")
    .insert([{ 
      user_id: userId, 
      payload,
    }])
    .select()
    .single()

  if (error) {
    console.error(`Failed to create broadcast: ${error.message}`)
    return null
  }

  return data
}

export async function getLatestBroadcast(userId: string): Promise<Broadcast | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from("broadcast")
    .select()
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error(`Failed to get lastest broadcast: ${error.message}`)
    return null
  }

  return data
}

export async function getFriendBroadcastsWithUser(userId: string): Promise<BroadcastWithUser[]> {
  const supabase = await dangerCreateServerRoleClient()
  const friends = await getFriendsWithUser(userId)
  const friendIds = friends?.map((f) => f.user_a_id === userId ? f.user_b_id : f.user_a_id) ?? []

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from("broadcast")
    .select()
    .in("user_id", friendIds)
    .gte("created_at", oneDayAgo)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Failed to get latest friend broadcast: ${error.message}`)
    return []
  }

  return data
    .map((broadcast) => ({
      ...broadcast,
      ...friends.find((f) => f.user_id === broadcast.user_id),
    }))
}

export async function createGoalBroadcast(userId: string, date: Date) {
  const goalsToday = await getGoalsByDate(userId, date)

  if (!goalsToday || goalsToday.length === 0) {
    return false
  }

  await createBroadcast(userId, {
    completed_goals: Array.from(new Set(goalsToday.map(goal => goal.priority)))
   });
}