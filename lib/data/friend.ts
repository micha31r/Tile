"use server";

import { dangerCreateServerRoleClient } from "../supabase/server-role";
import { Profile } from "./profile";

export interface Friend {
  user_a_id: string,
  user_b_id: string,
  created_at: Date,
}

export interface FriendWithUser extends Profile, Friend {
  email: string;
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

export async function getFriendsWithUser(userId: string): Promise<FriendWithUser[]> {
  const friends = await getFriends(userId);
  const friendIds = friends.map(friend => friend.user_a_id === userId ? friend.user_b_id : friend.user_a_id);

  const supabase = await dangerCreateServerRoleClient();

  const { data: profiles, error } = await supabase
    .from("profile")
    .select()
    .in("user_id", friendIds);

  if (error) {
    console.error("Error fetching friend profiles:", error);
    return [];
  }

  return friends.map(friend => {
    const profile = profiles.find(p => p.user_id === (friend.user_a_id === userId ? friend.user_b_id : friend.user_a_id));
    return {
      ...friend,
      ...profile
    };
  });
}

export async function removeFriend(currentUserId: string, targetUserId: string): Promise<boolean> {
  const supabase = await dangerCreateServerRoleClient();

  const { error } = await supabase
    .from("friend")
    .delete()
    .or(`user_a_id.eq.${currentUserId},user_b_id.eq.${currentUserId}`)
    .eq("user_a_id", targetUserId)
    .eq("user_b_id", currentUserId);

  if (error) {
    console.error("Error removing friend:", error);
    return false;
  }

  return true;
}