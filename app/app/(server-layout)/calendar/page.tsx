"use client";

import { CalendarMonth, Month } from "@/components/app/calendar-month";
import { useContext, useState } from "react";
import { ProfileContext } from "@/components/app/profile-context";
import { cn } from "@/lib/utils";
import { t } from "@/lib/theme";
import { useRouter } from "next/navigation";
import { useHaptic } from "react-haptic";

function getPreviousMonths(count: number): { month: Month; year: number }[] {
  const now = new Date();
  const months: { month: Month; year: number }[] = [];
  let currentMonth = now.getMonth() + 1;
  let currentYear = now.getFullYear();

  for (let i = 0; i < count; i++) {
    months.push({ month: currentMonth as Month, year: currentYear });
    currentMonth--;
    if (currentMonth < 1) {
      currentMonth = 12;
      currentYear--;
    }
  }
  return months;
}

export default function CalendarPage() {
  const profileContext = useContext(ProfileContext);
  const [monthCount, setMonthCount] = useState(3);
  const months = getPreviousMonths(monthCount);
  const router = useRouter();
  const { vibrate } = useHaptic();

  function handleBack() {
    vibrate();
    router.push("/app");
  }

  function handleLoadMore() {
    vibrate();
    setMonthCount(c => c + 3);
  }

  return (
    <div className="space-y-8">
      {months.map(({ year, month }) => {
        const date = new Date(year, month - 1, 1);
        return (
          <div key={`${year}-${month}`}> 
            <h2 className="font-medium mb-4">
              {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <CalendarMonth userId={profileContext.userId} year={year} month={month} showLabel />
          </div>
        );
      })}
      <div className="sticky bottom-8 grid grid-cols-2 gap-3">
        <button
          className="px-4 py-2.5 rounded-full text-background font-medium hover:scale-95 transition-transform bg-foreground"
          onClick={handleBack}
        >
          Back to app
        </button>
        <button
          className={cn("px-4 py-2.5 rounded-full text-white font-medium hover:scale-95 transition-transform", t("bg", profileContext.profile.theme, "f"))}
          onClick={handleLoadMore}
        >
          Load more
        </button>
      </div>
    </div>
  );
}
