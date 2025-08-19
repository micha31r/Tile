"use client"

import { cn } from "@/lib/utils";
import { Tile } from "../tile/tile";
import { FriendCard, FriendGallery } from "./friend-gallery";
import { FriendListPopup } from "./friend-list-popup";
import { BroadcastWithUser, getFriendBroadcastsWithUser } from "@/lib/data/broadcast";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export function FriendActivities() {
  const [broadcasts, setBroadcasts] = useState<BroadcastWithUser[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getClaims();
      if (error || !data?.claims) return

      const broadcasts = await getFriendBroadcastsWithUser(data.claims.sub);
      
      setBroadcasts(broadcasts);
      setLoaded(true);
    })()
  }, []);

  function getTileData(arr: number[]) {
    return { 
      tl: arr.includes(1), 
      tr: arr.includes(2), 
      bl: arr.includes(3), 
      br: arr.includes(4) 
    };
  }

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
          {broadcasts.map((broadcast, index) => (
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