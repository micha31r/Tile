"use server"

import { dangerCreateServerRoleClient } from "../supabase/server-role";
import { getFriendsWithUser } from "./friend";
import { Goal } from "./goal";
import { Profile } from "./profile";

export interface BroadcastPayload {
  completed_goal_ids: Array<number>;
}

export interface Broadcast {
  user_id: string;
  payload: BroadcastPayload;
  updated_at: Date;
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

export async function updateBroadcast(userId: string, payload: BroadcastPayload): Promise<Broadcast | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from("broadcast")
    .update({ 
      payload,
      updated_at: new Date()
    })
    .eq("user_id", userId)
    .select()
    .single()

  if (error) {
    console.error(`Failed to update broadcast: ${error.message}`)
    return null
  }

  return data
}

async function createOrUpdateBroadcast(userId: string, getNewPayload: (old: Broadcast | null) => BroadcastPayload): Promise<Broadcast | null> {
  const broadcast = await getBroadcast(userId)

  // Get the new payload with old data
  const payload = getNewPayload(broadcast)
  if (!payload) {
    return null
  }

  if (broadcast) {
    const updatedBroadcast = await updateBroadcast(userId, payload)

    if (updatedBroadcast) {
      return updatedBroadcast
    }
  }

  return await createBroadcast(userId, payload)
}

export async function completeGoalBroadcast(goal: Goal) {
  await createOrUpdateBroadcast(goal.user_id, (old: Broadcast | null) => {
    const oldPayload = old?.payload as BroadcastPayload;
    return {
      completed_goal_ids: Array.from(new Set([...(oldPayload?.completed_goal_ids || []), Number(goal.priority)]))
    };
  });
}

export async function getBroadcast(userId: string): Promise<Broadcast | null> {
  const supabase = await dangerCreateServerRoleClient()

  const { data, error } = await supabase
    .from("broadcast")
    .select()
    .eq("user_id", userId)
    .single()

  if (error) {
    console.error(`Failed to get broadcast: ${error.message}`)
    return null
  }

  return data
}

export async function getFriendBroadcastsWithUser(userId: string): Promise<BroadcastWithUser[]> {
  const supabase = await dangerCreateServerRoleClient()
  const friends = await getFriendsWithUser(userId)
  const friendIds = friends?.map((f) => f.user_a_id === userId ? f.user_b_id : f.user_a_id) ?? []

  const { data, error } = await supabase
    .from("broadcast")
    .select()
    .in("user_id", friendIds)

  if (error) {
    console.error(`Failed to get friend broadcast: ${error.message}`)
    return []
  }

  return data
    .map((broadcast) => ({
      ...broadcast,
      ...friends.find((f) => f.user_id === broadcast.user_id),
    }))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
}
