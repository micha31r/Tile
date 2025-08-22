import { createAuthSync } from "@/lib/data/auth";
import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token_hash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") ?? "/";
  const deviceId = url.searchParams.get("device");
  const ttlSecondsParam = url.searchParams.get("ttl_seconds");
  const ttlSeconds = Number(ttlSecondsParam ?? 120) || 120;

  if (token_hash && type) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // If a device id is present, bridge the session to the PWA
      // Note: verifyOtp returns session, we need access/refresh tokens

      const accessToken = data?.session?.access_token;
      const refreshToken = data?.session?.refresh_token;

      if (deviceId && accessToken && refreshToken) {
        const { error } = await createAuthSync({
          deviceId,
          accessToken,
          refreshToken,
          ttlSeconds
        });

        if (error) {
          console.error(`auth-sync upsert failed: ${error.message}`);
        }
      }

      redirect(next);
    } else {
      redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
    }
  }

  redirect(`/auth/login?error=${encodeURIComponent("No token hash or type")}`);
}
