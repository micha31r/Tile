"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useHaptic } from "react-haptic";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();
  const { vibrate } = useHaptic();

  const logout = async () => {
    vibrate();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return <button onClick={logout} className={className}>Logout</button>;
}
