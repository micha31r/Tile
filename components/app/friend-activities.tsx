/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { cn } from "@/lib/utils";
import { Tile } from "../tile/tile";
import { FriendCard, FriendGallery } from "./friend-gallery";
import { FriendListPopup } from "./friend-list-popup";
import { BroadcastWithUser, getFriendBroadcastsWithUser } from "@/lib/data/broadcast";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRealtime } from "../use-realtime";

function getTileData(arr: number[]) {
  return { 
    tl: arr.includes(1), 
    tr: arr.includes(2), 
    bl: arr.includes(3), 
    br: arr.includes(4)
  };
}

export function FriendActivities({ userId }: { userId: string }) {
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
    onInsert: (prev: BroadcastWithUser[], payload: any) => {
      return [payload.new, ...prev.filter(prev => prev.user_id !== payload.new.user_id)];
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

        <FriendGallery>
          {(broadcasts as BroadcastWithUser[]).map((broadcast, index) => (
            <FriendCard key={index} email={broadcast.email} firstName={broadcast.first_name} lastName={broadcast.last_name}>
              <div className={cn(`rounded-lg p-1.5 bg-blue-100`)}>
                <Tile data={getTileData(broadcast.payload.completed_goals)} backgroundClass={'bg-blue-100'} foregroundClass="bg-blue-700" maxWidth={64} radiusClass="rounded-md"/>
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
      </div>
  )
}