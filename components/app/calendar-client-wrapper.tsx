"use client"

import { CalendarMonth, Month } from "./calendar-month"

export function CalendarClientWrapper({ userId }: { userId: string }) {
  const now = new Date();
  const year = now.getFullYear();

  return (
    <div className="space-y-4">
      <h3 className="font-medium">{now.toLocaleString('default', { month: 'long' })}</h3>
      <CalendarMonth userId={userId} month={now.getMonth() + 1 as Month} year={year} showLabel={true} />
    </div>
  )
}