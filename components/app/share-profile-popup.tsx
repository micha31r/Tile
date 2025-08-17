"use client"

import { useEffect, useRef, useState } from "react";
import { Popup } from "./popup";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateProfile, Profile } from "@/lib/data/profile";
import QRCode from "react-qr-code";
import { cn, getDisplayName } from "@/lib/utils";
import { InfoAlert } from "../info-alert";
import { InfoIcon } from "lucide-react";
import { getValidOrCreateInvite, Invite } from "@/lib/data/invite";

export function ShareProfilePopup({ children }: { children?: React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);
  // const []

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getClaims();
      if (!data?.claims) return;
      
      const profile = await getOrCreateProfile(data.claims.sub);
      if (!profile) return;
      
      const invite = await getValidOrCreateInvite(data.claims.sub);
      if (!invite) return;

      setEmail(data.claims.email);
      setProfile(profile);
      setInvite(invite);

      console.log(`${window.location.origin}/add/?id=${profile!.user_id}&code=${invite.code}`)
    })();
  }, []);

  return (
    <Popup
      title="Share my profile"
      trigger={(callback) => {
        popupTriggerRef.current = callback;
        return <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{children}</div>;
      }}
    >
      <div className="space-y-4">
        <InfoAlert>
          <InfoIcon />
          Scan the QR code with your camera app
        </InfoAlert>

        <div className="space-y-2 py-4">
          <div className={cn("w-40 aspect-square p-1 bg-white m-auto", {
            "animate-pulse bg-secondary": !invite
          })}>
            {invite && (
              <QRCode
                className="h-auto max-w-full w-full"
                size={256}
                value={`${window.location.origin}/add/?id=${profile!.user_id}&code=${invite.code}`}
                viewBox={`0 0 256 256`}
              />
            )}
          </div>
          
          <p className={cn("bg-secondary text-muted-foreground font-semibold p-3 py-1.5 rounded-full w-max m-auto text-sm", {
            "animate-pulse": !profile
          })}>
            {profile ? (getDisplayName(profile.first_name, profile.last_name) ?? email) : "Loading..."}
          </p>
        </div>

        <button onClick={() => popupTriggerRef.current?.()} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
          Done
        </button>
      </div>
    </Popup>
  );
}