"use server"

import { createClient } from "../supabase/server";

function generateRandomCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const validityDuration = 60 * 60 * 1000; // 1 hour

export interface Invite {
  user_id: string;
  code: string;
  refreshed_at: Date;
}

export async function createInvite(userId: string): Promise<Invite | null> {
  const code = generateRandomCode();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invite')
    .insert({
      user_id: userId,
      code,
    })
    .select()
    .single();

  if (error) {
    console.error(`Failed to create invite: ${error.message}`);
    return null
  }

  return data;
}

export async function getInvite(userId: string): Promise<Invite | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('invite')
    .select()
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error(`Failed to retrieve invite: ${error.message}`);
    return null;
  }

  return data;
}


export async function refreshInvite(userId: string): Promise<Invite | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invite')
    .update({ code: generateRandomCode(), refreshed_at: new Date() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error(`Failed to refresh invite: ${error.message}`);
    return null;
  }

  return data;
}

export async function getValidOrCreateInvite(userId: string): Promise<Invite | null> {
  let invite = await getInvite(userId);

  if (invite) {
    const now = new Date();
    const refreshedAt = new Date(invite.refreshed_at);
    const expired = (now.getTime() - refreshedAt.getTime()) > validityDuration;

    if (expired) {
      invite = await refreshInvite(userId);
    }
    return invite;
  } else {
    return await createInvite(userId);
  }
}