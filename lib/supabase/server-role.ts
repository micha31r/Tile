"use server"
import { createClient } from '@supabase/supabase-js'

export async function dangerCreateServerRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.DANGER_SUPABASE_SERVER_ROLE_KEY!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}