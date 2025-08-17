"use server"

import { dangerCreateServerRoleClient } from "../supabase/server-role";

export interface Friend {
  user_a_id: string,
  user_b_id: string,
  created_at: Date,
}

export async function createFriend(currentUserId: string, targetUserId: string, code: string): Promise<boolean> {
  if (process.env.NODE_ENV === "production" && currentUserId === targetUserId) {
    console.warn("Cannot add yourself as a friend");
    return false;
  }

  const supabase = await dangerCreateServerRoleClient();

  // Verify that the invite exists and is valid
  const { data: invite, error: inviteError } = await supabase
    .from("invite")
    .select()
    .eq("user_id", targetUserId)
    .eq("code", code)
    .single();

  if (inviteError || !invite) {
    console.warn("Invite not found or error:", inviteError);
    return false;
  }

  // Create friend relationship
  const { error } = await supabase
    .from("friend")
    .insert({
      user_a_id: currentUserId,
      user_b_id: targetUserId,
    });

  if (error) {
    console.error("Error creating friend relationship:", error);
    return false;
  }

  return true;
}

export async function getFriends(userId: string): Promise<Friend[]> {
  const supabase = await dangerCreateServerRoleClient();

  const { data: friends, error } = await supabase
    .from("friend")
    .select()
    .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

  if (error) {
    console.error("Error fetching friends:", error);
    return [];
  }

  return friends as Friend[];
}

