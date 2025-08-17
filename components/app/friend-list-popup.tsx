"use client"

import { useEffect, useRef, useState } from "react";
import { Popup } from "./popup";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateProfile, Profile } from "@/lib/data/profile";
import { FriendDetails, getFriendsWithDetails, removeFriend } from "@/lib/data/friend";
import { TriangleAlertIcon } from "lucide-react";
import { getDisplayName, getInitials } from "@/lib/utils";
import { DangerAlert } from "../danger-alert";
import { useRouter } from "next/navigation";
import Avatar from "./avatar";

function FriendItemPopup({ friend, trigger }: { friend: FriendDetails; trigger: (onClick: () => void) => React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const [disabled, setDisabled] = useState(false);

  const displayName = getDisplayName(friend.first_name, friend.last_name) ?? friend.email;

  async function handleRemoveFriend() {
    setDisabled(true)
    const success = await removeFriend(friend.user_a_id, friend.user_b_id);
    if (success) {
      window.location.replace(`/app?success=Removed ${displayName} from friend list`);
    } else {
      window.location.replace(`/app?error=Failed to remove ${displayName} from friend list`);
    }
  }

  return (
    <Popup
      title="Remove friend"
      trigger={(callback) => {
        popupTriggerRef.current = callback;
        return trigger(callback);
      }}
    >
      <div className="space-y-4">
        <DangerAlert>
          <TriangleAlertIcon />
          Are you sure you want to remove {displayName} from your friend list?
        </DangerAlert>
        <div className="flex gap-3">
          <button onClick={() => popupTriggerRef.current?.()} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
            Cancel
          </button>
          <button disabled={disabled} onClick={handleRemoveFriend} className="bg-red-100 disabled:opacity-80 text-red-700 rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
            Remove
          </button>
        </div>
      </div>
    </Popup>
  );
}

export function FriendListPopup({ children }: { children?: React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [friends, setFriends] = useState<FriendDetails[]>([])
  const triggers = useRef<(() => void)[]>([])

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getClaims();
      if (!data?.claims) {
        return;
      }

      const profile = await getOrCreateProfile(data.claims.sub);
      if (!profile) return null;
      setProfile(profile);

      const friends = await getFriendsWithDetails(profile.user_id);
      setFriends(friends);
    })();
  }, []);

  // Separate trigger function and popup components
  triggers.current = []
  const items = friends.map((friend, index) => (
    <FriendItemPopup key={index} friend={friend} trigger={(callback) => {
      triggers.current.push(callback);
      return null;
    }} />
  ))

  return (
    <>
      <Popup
        title="Friend list"
        trigger={(callback) => {
          popupTriggerRef.current = callback;
          return <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{children}</div>;
        }}
      >
        {profile && (
          <div className="space-y-4">
            {friends.map((friend, index) => (
              <div key={index} className="flex flex-row gap-3 items-center rounded-xl p-3 bg-secondary font-medium">
                <Avatar size={32} firstName={friend.first_name} lastName={friend.last_name} email={friend.email} />
                <h4 className="text-sm line-clamp-1 mr-auto">{getDisplayName(friend.first_name, friend.last_name) ?? friend.email}</h4>
                <button key={index} onClick={() => triggers.current[index]?.()} className="text-sm bg-red-100 text-red-600 p-1 px-2 rounded-md">
                  Remove
                </button>
              </div>
            ))}

            <button onClick={() => popupTriggerRef.current?.()} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
              Close
            </button>
          </div>
        )}
      </Popup>

      {items}
    </>
  );
}