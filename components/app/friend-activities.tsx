/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import { Tile } from "../tile/tile";
import { FriendCard, FriendGallery } from "./friend-gallery";
import { FriendListPopup } from "./friend-list-popup";
import { BroadcastWithUser, getFriendBroadcastsWithUser } from "@/lib/data/broadcast";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { useRealtime } from "../use-realtime";
import { InfoAlert } from "../info-alert";
import { InfoIcon } from "lucide-react";
import { t } from "@/lib/theme";

function getTileData(arr: number[]) {
  return { 
    tl: arr.includes(1), 
    tr: arr.includes(2), 
    bl: arr.includes(3), 
    br: arr.includes(4)
  };
}

export function FriendActivities({ userId, emptyMessage }: { userId: string, emptyMessage?: string }) {
  const [loaded, setLoaded] = useState(false);

  const [broadcasts] = useRealtime<BroadcastWithUser>({
    channelName: 'friend-activities-list',
    schema: 'public',
    table: 'broadcast',
    filter: `user_id=eq.${userId}`,
    getInitialData: async () => {
      const data = await getFriendBroadcastsWithUser(userId);
      setLoaded(true);
      return data;
    },
    onInsert: async (prev: BroadcastWithUser[], payload: any) => {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", payload.new.user_id)
        .single();

      const newEntry: BroadcastWithUser = { ...payload.new, ...profile, email: '' };
      const filtered = prev.filter(item => item.user_id !== payload.new.user_id);
      return [...filtered, newEntry].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },
  });

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Friends</h3>
          <div>
            <FriendListPopup>
              <button className="flex items-center justify-center gap-1 rounded-full w-max h-8 p-2 px-3 bg-secondary text-sm font-medium text-muted-foreground">
                See all
              </button>
            </FriendListPopup>
          </div>
        </div>

        {(!loaded || broadcasts.length > 0) && (
          <FriendGallery>
            {(broadcasts as BroadcastWithUser[]).map((broadcast, index) => (
              <FriendCard key={index} email={broadcast.email} firstName={broadcast.first_name} lastName={broadcast.last_name}>
                <div className={cn(`rounded-lg p-1.5`, t("bg", broadcast.theme, "b"))}>
                  <Tile data={getTileData(broadcast.payload.completed_goals)} backgroundClass={t("bg", broadcast.theme, "b")} foregroundClass={t("bg", broadcast.theme, "f")} maxWidth={64} radiusClass="rounded-md"/>
                </div>
              </FriendCard>
            ))}

            {!loaded && (
              <>
                <div className="h-52 animate-pulse rounded-3xl bg-secondary p-2 space-y-2"></div>
                <div className="h-52 animate-pulse rounded-3xl bg-secondary p-2 space-y-2"></div>
              </>
            )}
          </FriendGallery>
        )}

        {loaded && broadcasts.length === 0 && emptyMessage && (
          <InfoAlert>
            <InfoIcon />
            {emptyMessage}
          </InfoAlert>
        )}
      </div>
  );
}