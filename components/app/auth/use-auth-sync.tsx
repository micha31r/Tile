"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { claimAuthSync } from "@/lib/data/auth";

export function useAuthSync(deviceId: string | null, timeoutMs = 120_000) {
  const [status, setStatus] = useState<"idle" | "polling" | "success" | "error" | "timeout">("idle");
  const stopRef = useRef(false);

  useEffect(() => {
      if (!deviceId) return;
      setStatus("polling");

      const start = Date.now();
      let finished = false;

      const interval = setInterval(async () => {
        if (finished || stopRef.current) return;
        if (Date.now() - start >= timeoutMs) {
          setStatus("timeout");
          clearInterval(interval);
          finished = true;
          return;
        }

        const data = await claimAuthSync(deviceId);

        if (data.ok && data.found) {
          const supabase = createClient();
          await supabase.auth.setSession({
            access_token: data.accessToken,
            refresh_token: data.refreshToken
          });
          setStatus("success");
          clearInterval(interval);
          finished = true;
        } else {
          setStatus("error");
        }
      }, 2000);

      return () => {
        finished = true;
        clearInterval(interval);
      };
  }, [deviceId, timeoutMs]);

  const stop = () => { stopRef.current = true; };

  return { status, stop };
}
