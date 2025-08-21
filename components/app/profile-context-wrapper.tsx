"use client";

import { getOrCreateProfile, Profile } from "@/lib/data/profile";
import { ProfileContext, ProfileContextData } from "./profile-context";
import { JwtPayload } from "@supabase/supabase-js";
import { useRealtime } from "../use-realtime";
import { useEffect, useState } from "react";
import Loading from "@/app/loading";
import { cn } from "@/lib/utils";

export function ProfileContextWrapper({ user, children }: { user: JwtPayload, children: React.ReactNode }) {
  const [loaded, setLoad] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

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

  useEffect(() => {
    if (profiles.length > 0) {
      window.location.href = "/auth/login";
      setProfile((profiles as Profile[])[0]);
    }
  }, [profiles]);

  if (!loaded || !profile) {
    return <Loading />;
  }

  const contextData: ProfileContextData = {
    email: user.email,
    userId: user.sub,
    profile: profile
  };

  return (
    <ProfileContext value={contextData}>
      <Loading className={cn("fixed z-30 inset-0 w-full h-[100svh]", {
        "opacity-0 pointer-events-none": loaded
      })} />
      {children}
    </ProfileContext>
  );
}