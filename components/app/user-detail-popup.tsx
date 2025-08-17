"use client"

import { useEffect, useRef, useState } from "react";
import { Popup } from "./popup";
import { UserDetailForm } from "./user-detail-form";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateProfile, Profile } from "@/lib/data/profile";

export function UserDetailPopup({ children }: { children?: React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getClaims();
      if (!data?.claims) {
        return;
      }

      const profile = await getOrCreateProfile(data.claims.sub);
      setProfile(profile || null);
    })();
  }, []);

  return (
    <Popup
      title="Update profile"
      trigger={(callback) => {
        popupTriggerRef.current = callback;
        return <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{children}</div>;
      }}
    >
      {profile && (
        <div className="space-y-4">
          <UserDetailForm userId={profile.user_id} initialValues={profile} onSuccess={() => {
            popupTriggerRef.current?.();
          }} />
        </div>
      )}
    </Popup>
  );
}