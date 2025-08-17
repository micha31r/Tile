import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarMonth } from "@/components/app/calendar-month";
import { FriendCard, FriendGallery } from "@/components/app/friend-gallery";
import { Tile } from "@/components/tile/tile";
import { cn } from "@/lib/utils";
import { CheckIcon, Goal, PlusIcon } from "lucide-react";
import { Countdown } from "@/components/app/countdown";
import { RecordGoalPopup } from "@/components/app/record-goal-popup";

export default async function AppHomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-8">
      {/* <div className="space-y-4"> */}
        {/* <h3 className="font-medium">Today</h3> */}
        <div className="space-y-2 p-4 bg-blue-50 rounded-3xl">
          <h4 className="font-medium">Daily goals</h4>
          <p className="text-sm">Plan your day before the timer runs out to maintain your streak. You will review these goals at the end of the day.</p>
          <div className="flex w-full justify-center p-4 py-4">
            <Countdown target={new Date("2025-08-18T12:00:00")} />
          </div>
          <RecordGoalPopup />
        </div>
      {/* </div> */}

      <div className="space-y-4">
        <h3 className="font-medium">Today</h3>

        <div className="space-y-2 font-medium">
          <div className="flex flex-row gap-3 items-center rounded-xl p-3 bg-secondary">
            <div className="flex justify-center items-center w-6 aspect-square bg-neutral-200 text-muted-foreground rounded-full text-sm">
              1
            </div>
            <h4 className="text-sm line-clamp-1 mr-auto">Finish part 2 of graphics assignment</h4>
            <div className="flex w-6 aspect-square bg-blue-100 rounded-full">
              <CheckIcon className="w-4 h-4 m-auto text-blue-700" strokeWidth={3} />
            </div>
          </div>

          <div className="flex flex-row gap-3 justify-between items-center rounded-xl p-3 bg-secondary">
            <div className="flex justify-center items-center w-6 aspect-square bg-neutral-200 text-muted-foreground rounded-full text-sm">
              2
            </div>
            <h4 className="text-sm line-clamp-1 mr-auto">Review DP modules</h4>
            <div className="flex w-6 aspect-square border-2 border-border rounded-full">
            </div>
          </div>

          <div className="flex flex-row gap-3 items-center rounded-xl p-3 bg-secondary">
            <div className="flex justify-center items-center w-6 aspect-square bg-neutral-200 text-muted-foreground rounded-full text-sm">
              3
            </div>
            <h4 className="text-sm line-clamp-1 mr-auto">Email manager about project updates</h4>
            <div className="flex w-6 aspect-square bg-blue-100 rounded-full">
              <CheckIcon className="w-4 h-4 m-auto text-blue-700" strokeWidth={3} />
            </div>
          </div>

           <div className="flex flex-row gap-3 items-center rounded-xl p-3 bg-secondary">
            <div className="flex justify-center items-center w-6 aspect-square bg-neutral-200 text-muted-foreground rounded-full text-sm">
              4
            </div>
            <h4 className="text-sm line-clamp-1 mr-auto">Do laundry</h4>
            <div className="flex w-6 aspect-square bg-blue-100 rounded-full">
              <CheckIcon className="w-4 h-4 m-auto text-blue-700" strokeWidth={3} />
            </div>
          </div>
        </div>
      </div>

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
