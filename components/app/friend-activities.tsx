import { cn } from "@/lib/utils";
import { Tile } from "../tile/tile";
import { FriendCard, FriendGallery } from "./friend-gallery";
import { FriendListPopup } from "./friend-list-popup";
import { getFriendBroadcastsWithUser } from "@/lib/data/broadcast";
import { createClient } from "@/lib/supabase/server";

export async function FriendActivities() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    return
  }

  const broadcasts = await getFriendBroadcastsWithUser(data.claims.sub);

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
                <Tile data={getTileData(broadcast.payload.completed_goal_ids)} backgroundClass={'bg-blue-100'} foregroundClass="bg-blue-700" maxWidth={64} radiusClass="rounded-md"/>
              </div>
            </FriendCard>
          ))}
        </FriendGallery>
      </div>
  )
}