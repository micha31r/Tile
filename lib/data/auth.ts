"use server";

import { dangerCreateServerRoleClient } from '@/lib/supabase/server-role';
import { PostgrestSingleResponse } from '@supabase/supabase-js';

export type AuthSyncParams = {
  deviceId: string;
  accessToken: string;
  refreshToken: string;
  ttlSeconds?: number;
};

export type CreateAuthSyncResponse = PostgrestSingleResponse<null> | { error: { message: string } };

export type ClaimAuthSyncResult =
  | { ok: true; found: false }
  | { ok: true; found: true; accessToken: string; refreshToken: string };

export async function createAuthSync(params: AuthSyncParams): Promise<CreateAuthSyncResponse> {
  const { deviceId, accessToken, refreshToken, ttlSeconds } = params;
  if (!deviceId || !accessToken || !refreshToken) return { error: { message: 'Missing parameters' } };

  const expiresAt = new Date(Date.now() + Number(ttlSeconds ?? 120) * 1000).toISOString();

  const supabase = await dangerCreateServerRoleClient();
  return await supabase.from('auth_sync').upsert({
    device_id: deviceId,
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt
  }, { onConflict: 'device_id' });
}

export async function claimAuthSync(deviceId: string): Promise<ClaimAuthSyncResult> {
  if (!deviceId) return { ok: true, found: false };

  const supabase = await dangerCreateServerRoleClient();

  const { data, error } = await supabase
    .from('auth_sync')
    .select('access_token, refresh_token, expires_at')
    .eq('device_id', deviceId)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('auth_sync select error:', error);
    return { ok: true, found: false };
  }
  if (!data) {
    return { ok: true, found: false };
  }

  if (new Date(data.expires_at).getTime() < Date.now()) {
    await supabase.from('auth_sync').delete().eq('device_id', deviceId);
    return { ok: true, found: false };
  }

  // Delete after single use
  await supabase.from('auth_sync').delete().eq('device_id', deviceId);

  return {
    ok: true,
    found: true,
    accessToken: data.access_token,
    refreshToken: data.refresh_token
  };
}
