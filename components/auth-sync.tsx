"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthSync() {
  const router = useRouter();

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const onMessage = async (e: MessageEvent) => {
      if (e.data?.type === "login") {
        const supabase = createClient();
        await supabase.auth.getSession(); // pull fresh session
        router.refresh(); // re-render RSC dependent on cookies
      }
    };
    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => navigator.serviceWorker.removeEventListener("message", onMessage);
  }, [router]);

  return null;
}
