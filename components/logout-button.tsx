"use client";

import { createClient } from "@/lib/supabase/client";
import { useHaptic } from "react-haptic";

export function LogoutButton({ className }: { className?: string }) {
  const { vibrate } = useHaptic();

  const logout = async () => {
    vibrate();
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return <button onClick={logout} className={className}>Logout</button>;
}
