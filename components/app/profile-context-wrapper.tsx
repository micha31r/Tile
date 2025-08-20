"use client";

import { getOrCreateProfile, Profile } from "@/lib/data/profile";
import { ProfileContext, ProfileContextData } from "./profile-context";
import { JwtPayload } from "@supabase/supabase-js";
import { useRealtime } from "../use-realtime";
import { useState } from "react";

export function ProfileContextWrapper({ user, children }: { user: JwtPayload, children: React.ReactNode }) {
  const [loaded, setLoad] = useState(false);

  const [profiles] = useRealtime<Profile>({
    channelName: 'profile',
    schema: 'public',
    table: 'profile',
    filter: `user_id=eq.${user.sub}`,
    getInitialData: async () => {
      const profile = await getOrCreateProfile(user.sub);
      setLoad(true);
      return profile ? [profile] : [];
    }
  });

  if (!loaded) {
    return null;
  }

  if (profiles.length === 0) {
    window.location.reload();
    return null;
  }

  const contextData: ProfileContextData = {
    email: user.email,
    userId: user.sub,
    profile: (profiles as Profile[]).at(0)!
  };

  return (
    <ProfileContext value={contextData}>
      {children}
    </ProfileContext>
  );
}