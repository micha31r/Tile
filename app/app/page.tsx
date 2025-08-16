import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarMonth } from "@/components/app/calendar-month";
import { FriendCard, FriendGallery } from "@/components/app/friend-gallery";
import { Tile } from "@/components/tile/tile";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";

export default async function AppHomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-medium">August</h3>
        <CalendarMonth month={10} year={2025} showLabel={true} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Friends</h3>
          <button className="flex items-center justify-center gap-1 rounded-full w-max h-8 p-2 pl-3 bg-secondary text-sm font-medium text-muted-foreground">
            <span>Add</span>
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
        <FriendGallery>
          <FriendCard email="tes@test.com" name="Michael">
            <div className={cn(`rounded-lg p-1.5 bg-blue-100`)}>
              <Tile data={{ tl: true, tr: true, bl: false, br: true }} backgroundClass={'bg-blue-100'} foregroundClass="bg-blue-700" maxWidth={64} radiusClass="rounded-md"/>
            </div>
          </FriendCard>
          <FriendCard email="jess@test.com" name="Jess">
            <div className={cn(`rounded-lg p-1.5 bg-yellow-50`)}>
              <Tile data={{ tl: true, tr: false, bl: false, br: true }} backgroundClass={'bg-yellow-50'} foregroundClass="bg-yellow-500" maxWidth={64} radiusClass="rounded-md"/>
            </div>
          </FriendCard>

          <FriendCard email="daniel@test.com" name="Daniel">
            <div className={cn(`rounded-lg p-1.5 bg-red-100`)}>
              <Tile data={{ tl: true, tr: true, bl: false, br: true }} backgroundClass={'bg-red-100'} foregroundClass="bg-red-500" maxWidth={64} radiusClass="rounded-md"/>
            </div>
          </FriendCard>

          <FriendCard email="emily@test.com" name="Emily">
            <div className={cn(`rounded-lg p-1.5 bg-purple-100`)}>
              <Tile data={{ tl: false, tr: true, bl: false, br: true }} backgroundClass={'bg-purple-100'} foregroundClass="bg-purple-500" maxWidth={64} radiusClass="rounded-md"/>
            </div>
          </FriendCard>


          <FriendCard email="rania@test.com" name="Rania">
            <div className={cn(`rounded-lg p-1.5 bg-green-100`)}>
              <Tile data={{ tl: false, tr: true, bl: true, br: false }} backgroundClass={'bg-green-100'} foregroundClass="bg-green-500" maxWidth={64} radiusClass="rounded-md"/>
            </div>
          </FriendCard>

          <FriendCard email="shawn@test.com" name="Shawn">
            <div className={cn(`rounded-lg p-1.5 bg-orange-100`)}>
              <Tile data={{ tl: false, tr: false, bl: true, br: false }} backgroundClass={'bg-orange-100'} foregroundClass="bg-orange-500" maxWidth={64} radiusClass="rounded-md"/>
            </div>
          </FriendCard>

          <FriendCard email="matilda@test.com" name="Matilda">
            <div className={cn(`rounded-lg p-1.5 bg-cyan-100`)}>
              <Tile data={{ tl: false, tr: true, bl: false, br: false }} backgroundClass={'bg-cyan-100'} foregroundClass="bg-cyan-500" maxWidth={64} radiusClass="rounded-md"/>
            </div>
          </FriendCard>
        </FriendGallery>
      </div>
    </div>
  );
}
