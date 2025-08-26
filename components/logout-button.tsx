"use client";

import { createClient } from "@/lib/supabase/client";
import { useHaptic } from "react-haptic";

const supabase = createClient();

export async function unregisterPush() {
  if (!("serviceWorker" in navigator)) return;

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();

  if (sub) {
    // Unsubscribe locally
    const success = await sub.unsubscribe().catch(() => false);

    const { error } = await supabase
      .from('user_push_subscriptions')
      .delete()
      .eq('endpoint', sub.endpoint);

    if (error) {
      console.log("[push] failed to unsubscribe", error);
    } else {
      console.log("[push] unsubscribed", success, sub.endpoint);
    }
  }
}

export function LogoutButton({ className }: { className?: string }) {
  const { vibrate } = useHaptic();

  const logout = async () => {
    vibrate();
    await unregisterPush();
    await supabase.auth.signOut({
      scope: 'local'
    });
    window.location.href = "/auth/login";
  };

  return <button onClick={logout} className={className}>Logout</button>;
}
