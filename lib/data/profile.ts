"use server";

import { createClient } from "../supabase/server";
import { fallbackTheme, Theme } from "../theme";
import { getDisplayName } from "../utils";

export interface Profile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  theme?: Theme;
  timezone: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error(`Error fetching profile for user ${userId}: ${error.message}`);
    return null;
  }

  return data;
}

export async function createProfile(userId: string, profile: Partial<Profile>): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profile")
    .insert({ user_id: userId, ...profile })
    .single();

  if (error) {
    console.error(`Error creating profile for user ${userId}: ${error.message}`);
    return null;
  }

  return data;
}

export async function getOrCreateProfile(userId: string): Promise<Profile | null> {
  const profile = await getProfile(userId);
  if (profile) {
    return profile;
  }

  // If no profile exists, create a new one
  const newProfile = await createProfile(userId, {
    theme: fallbackTheme
  });

  return newProfile;
}

export async function updateProfile(userId: string, profile: Partial<Profile>): Promise<Profile | null> {
  const supabase = await createClient();

  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .update(profile)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (profileError) {
    console.error(`Error updating profile for user ${userId}: ${profileError.message}`);
    return null;
  }

  const displayName = getDisplayName(profile.first_name, profile.last_name);

  const { error: userError } = await supabase.auth.updateUser({
    data: { display_name: displayName }
  });

  if (userError) {
    console.error(`Error updating user for profile ${userId}: ${userError.message}`);
  }

  return profileData;
}