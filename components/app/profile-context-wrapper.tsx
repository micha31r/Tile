"use client"

import { getOrCreateProfile, Profile } from "@/lib/data/profile";
import { ProfileContext, ProfileContextData } from "./profile-context";
import { JwtPayload } from "@supabase/supabase-js";
import { useRealtime } from "../use-realtime";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ProfileContextWrapper({ user, children }: { user: JwtPayload, children: React.ReactNode }) {
  const router = useRouter();
  const [loaded, setLoad] = useState(false);

  const [profiles] = useRealtime<Profile>({
    channelName: 'goal-today-calendar',
    schema: 'public',
    table: 'goal',
    filter: `user_id=eq.${user.sub}`,
    getInitialData: async () => {
      const profile = await getOrCreateProfile(user.sub)
      setLoad(true);
      return profile ? [profile] : []
    }
  });

  if (!loaded) {
    return null;
  }

  if (profiles.length === 0) {
    router.push("/auth/login")
    return null;
  }

  const contextData: ProfileContextData = {
    email: user.email,
    userId: user.sub,
    profile: (profiles as Profile[]).at(0)!
  }

  return (
    <ProfileContext value={contextData}>
      {children}
    </ProfileContext>
  )
}