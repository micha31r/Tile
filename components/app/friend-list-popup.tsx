"use client";

import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Popup } from "./popup";
import { FriendWithUser, getFriendsWithUser, removeFriend } from "@/lib/data/friend";
import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { getDisplayName } from "@/lib/utils";
import { DangerAlert } from "../danger-alert";
import Avatar from "./avatar";
import { InfoAlert } from "../info-alert";
import { ProfileContext } from "./profile-context";
import { useHaptic } from "react-haptic";

function FriendItemPopup({ friend, trigger }: { friend: FriendWithUser; trigger: (onClick: () => void) => React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const [disabled, setDisabled] = useState(false);
  const { vibrate } = useHaptic();

  const displayName = getDisplayName(friend.first_name, friend.last_name) || friend.email || "user";

  async function handleRemoveFriend() {
    setDisabled(true);
    vibrate();
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
          <button disabled={disabled} onClick={handleRemoveFriend} className="disabled:opacity-80 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
            Remove
          </button>
        </div>
      </div>
    </Popup>
  );
}

export function FriendListPopup({ children }: { children?: React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const { userId } = useContext(ProfileContext);
  const [friends, setFriends] = useState<FriendWithUser[]>([]);
  const [loaded, setLoaded] = useState(false);
  const triggers = useRef<(() => void)[]>([]);
  const items = useMemo(() => {
    if (friends.length === 0) {
      return [];
    }
    triggers.current = Array(friends.length).fill(undefined);
    return friends.map((friend, index) => (
      <FriendItemPopup key={index} friend={friend} trigger={(callback) => {
        triggers.current[index] = callback;
        return null;
      }} />
    ));
  }, [friends]);

  useEffect(() => {
    (async () => {
      const friends = await getFriendsWithUser(userId);
      setFriends(friends);
      setLoaded(true);
    })();
  }, [userId]);

  return (
    <>
      <Popup
        title="Friend list"
        trigger={(callback) => {
          popupTriggerRef.current = callback;
          return <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{children}</div>;
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {friends.map((friend, index) => (
              <div key={index} className="flex flex-row gap-3 items-center rounded-xl p-3 bg-secondary font-medium">
                <Avatar size={32} firstName={friend.first_name} lastName={friend.last_name} email={friend.email} style={(!friend.first_name && !friend.last_name && !friend.email) ? "shape" : "character"} />
                <h4 className="flex-1 text-sm mr-auto">
                  <span className="line-clamp-1 break-all">{getDisplayName(friend.first_name, friend.last_name) || friend.email || "--"}</span>
                </h4>
                <button key={index} onClick={() => triggers.current[index]?.()} className="text-sm bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 p-1 px-2 rounded-md">
                  Remove
                </button>
              </div>
            ))}

            {!loaded && (
              <>
                <div className="w-full h-14 rounded-xl p-3 bg-secondary animate-pulse"></div>
              </>
            )}

            {loaded && friends.length === 0 && (
              <InfoAlert>
                <InfoIcon />
                No friends added
              </InfoAlert>
            )}
          </div>

          <button onClick={() => popupTriggerRef.current?.()} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
            Close
          </button>
        </div>
      </Popup>

      {items}
    </>
  );
}