"use client";

import Link from "next/link";
import { CalendarMonth, Month } from "./calendar-month";
import { useHaptic } from "react-haptic";

export function CalendarClientWrapper({ userId }: { userId: string }) {
  const now = new Date();
  const year = now.getFullYear();
  const { vibrate } = useHaptic();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{now.toLocaleString('default', { month: 'long' })}</h3>
        <div>
          <Link href={`/app/calendar`} onClick={vibrate}>
            <button className="hover:scale-95 transition-transform flex items-center justify-center gap-1 rounded-full w-max h-8 p-2 px-3 bg-secondary text-sm font-medium text-muted-foreground">
              More
            </button>
          </Link>
        </div>
      </div>
      <CalendarMonth userId={userId} month={now.getMonth() + 1 as Month} year={year} showLabel={true} />
    </div>
  );
}