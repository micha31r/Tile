"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { Popup } from "./popup";
import QRCode from "react-qr-code";
import { cn, getDisplayName } from "@/lib/utils";
import { InfoAlert } from "../info-alert";
import { InfoIcon } from "lucide-react";
import { getValidOrCreateInvite, Invite } from "@/lib/data/invite";
import { ProfileContext } from "./profile-context";

export function ShareProfilePopup({ children }: { children?: React.ReactNode }) {
  const { profile, email, userId } = useContext(ProfileContext);
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const [invite, setInvite] = useState<Invite | null>(null);

  useEffect(() => {
    (async () => {
      const invite = await getValidOrCreateInvite(userId);
      if (!invite) return;
      setInvite(invite);

      if (process.env.NODE_ENV === "development") {
        console.log(`${window.location.origin}/add/?id=${profile!.user_id}&code=${invite.code}`);
      }
    })();
  }, [profile, email, userId]);

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
                value={`${window.location.origin}/add/?id=${userId}&code=${invite.code}`}
                viewBox={`0 0 256 256`}
              />
            )}
          </div>
          
          <p className="bg-secondary text-muted-foreground font-semibold p-3 py-1.5 rounded-full w-max max-w-full m-auto text-sm">
            <span className="line-clamp-1 break-all">{getDisplayName(profile.first_name, profile.last_name) || email}</span>
          </p>
        </div>

        <button onClick={() => popupTriggerRef.current?.()} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
          Done
        </button>
      </div>
    </Popup>
  );
}