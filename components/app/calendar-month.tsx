"use client";

import { cn, getDateString } from "@/lib/utils";
import { Tile } from "../tile/tile";
import { Goal } from "@/lib/data/goal";
import { useRealtime } from "../use-realtime";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useRef, useState } from "react";
import { CalendarCellPopup } from "./calendar-cell-popup";
import { XIcon } from "lucide-react";

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type DayEntry = {
  date: string;
  goals: Goal[];
};

export type CalendarMonthData = {
  [key: string]: DayEntry
};

export type CellData = {
  status: CellStatus;
  tileShape: {
    tl: boolean;
    tr: boolean;
    bl: boolean;
    br: boolean;
  };
};

// Unset -> no goals
// Set -> some or all goals set, but none completed
// Partial -> some goals completed
// Complete -> all goals completed
export type CellStatus = "unset" | "set" | "partial" | "complete";

function getCellData(entry: DayEntry): CellData {
  const completed = new Set<number>();
  const priorities = new Set<number>();

  for (const goal of entry.goals) {
    if (goal.completed) completed.add(goal.priority);
    priorities.add(goal.priority);
  }

  let status: CellStatus;

  if (entry.goals.length === 0) {
    status = "unset";
  } else if (completed.size === 0) {
    status = "set";
  } else if (completed.size < 4) {
    status = "partial";
  } else {
    status = "complete";
  }

  return {
    status: status,
    tileShape: {
      tl: priorities.has(1) && completed.has(1),
      tr: priorities.has(2) && completed.has(2),
      bl: priorities.has(3) && completed.has(3),
      br: priorities.has(4) && completed.has(4)
    }
  };
}

const setColor = "text-neutral-300 dark:text-neutral-600";
const partialColor = "bg-neutral-300 dark:bg-neutral-600";
const allCompletedColor = "bg-slate-700 dark:bg-neutral-300";
const backgroundColor = "bg-neutral-100 dark:bg-neutral-800";
const borderColor = "border-neutral-100 dark:border-neutral-800";

export function CalendarCell({ 
  entry, 
  handleClick 
}: { 
  entry: DayEntry; 
  handleClick: (data: DayEntry) => void 
}) {
  const cell = getCellData(entry);
  const isFutureDate = new Date(entry.date) > new Date();
  let cellContent;

  if (cell.status === "unset") {
    cellContent = (
      <div className={cn("flex w-full aspect-square rounded-md", backgroundColor, {
        [`scale-[25%]`]: isFutureDate
      })}>
      </div>
    );
  } else if (cell.status === "set") {
    cellContent = (
      <div className={cn("flex w-full aspect-square rounded-md p-2", backgroundColor)}>
        <XIcon className={cn("flex-1 w-auto h-auto", setColor)} strokeWidth={3} />
      </div>
    );
  } else {
    cellContent = (
      <div className={cn(`rounded-md p-1`, backgroundColor)}>
        <Tile data={cell.tileShape} foregroundClass={cn({
          [partialColor]: cell.status === "partial",
          [allCompletedColor]: cell.status === "complete"
        })} backgroundClass={backgroundColor} radiusClass="rounded-sm" maxWidth={100}/>
      </div>
    );
  }

  return (
    <div onClick={() => handleClick(entry)}>
      {cellContent}
    </div>
  );
}

export function CalendarCellToday({ 
  entry, 
  handleClick 
}: { 
  entry: DayEntry; 
  handleClick: (data: DayEntry) => void 
}) {
  const [cell, setCell] = useState<CellData>(getCellData(entry));

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const startUTC = start.toISOString();

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const [goals] = useRealtime<Goal>({
    channelName: 'goal-today-calendar',
    schema: 'public',
    table: 'goal',
    filter: `created_at=gte.${startUTC}`,
    getInitialData: async () => {
      return entry.goals;
    }
  });

  // Manually filter for lte client-side
  const todayGoals = (goals as Goal[]).filter(goal => {
    const created = new Date(goal.created_at);
    return created <= end;
  });

  useEffect(() => {
    setCell(getCellData({
      date: getDateString(new Date()),
      goals: todayGoals
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals]);

  let cellContent;

  if (cell.status === "unset") {
    cellContent = (
      <div className={cn("flex w-full aspect-square rounded-sm", backgroundColor)}></div>
    );
  } else if (cell.status === "set") {
    cellContent = (
      <div className={cn("flex w-full aspect-square rounded-sm", backgroundColor)}></div>
    );
  } else {
    cellContent = (
      <div className={cn(`rounded-md p-1`, backgroundColor)}>
        <Tile data={cell.tileShape} foregroundClass={cn({
          [partialColor]: cell.status === "partial",
          [allCompletedColor]: cell.status === "complete"
        })} backgroundClass={backgroundColor} radiusClass="rounded-sm" maxWidth={100}/>
      </div>
    );
  }

  return (
    <div onClick={() => handleClick({
      date: entry.date,
      goals: goals as Goal[]
    })}>
      {cellContent}
    </div>
  );
}

function PlaceHolderCells({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <CalendarCell entry={{ date: '0000-00-00', goals: [] } as unknown as DayEntry} handleClick={() => {}} />
        </div>
      ))}
    </>
  );
}

export function CalendarMonth({ userId, month, year, showLabel = false }: { userId: string, month: Month; year: number; showLabel?: boolean }) {
  const daysInMonth = new Date(year, month, 0).getDate();

  // Adjust so Monday is first column: Sunday (0) -> 6, Monday (1) -> 0, etc.
  const jsDay = new Date(year, month - 1, 1).getDay();
  const startDay = (jsDay === 0) ? 6 : jsDay - 1;
  const [data, setData] = useState<CalendarMonthData>({});
  const [loaded, setLoaded] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DayEntry>({ date: '', goals: [] });
  const popupTriggerRef = useRef<(() => void) | null>(null);

  const todayDateString = getDateString(new Date());

  async function getCalendarData() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
      return {};
    }

    // Calculate local month start/end
    const localStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const localEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // Convert to UTC ISO strings
    const startUTC = localStart.toISOString();
    const endUTC = localEnd.toISOString();

    const { data: goals, error: rpcError } = await createClient()
      .rpc('get_goals_for_month', {
        user_id: userId,
        start_utc: startUTC,
        end_utc: endUTC
      });

    if (rpcError) {
      console.error('Failed to fetch monthly goals:', rpcError.message);
      setLoaded(true);
      return {};
    }

    // Map results to CalendarMonthData
    const goalData: CalendarMonthData = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day);
      const dateString = getDateString(date);
      goalData[dateString] = {
        date: dateString,
        goals: (goals ?? []).filter((goal: Goal) => {
          // Compare only date part
          const goalDate = new Date(goal.created_at);
          return goalDate.getFullYear() === date.getFullYear() &&
                 goalDate.getMonth() === date.getMonth() &&
                 goalDate.getDate() === date.getDate();
        })
      };
    }
    setLoaded(true);
    return goalData;
  }

  useEffect(() => {
    (async () => {
      const data = await getCalendarData();
      setData(data);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClick(data: DayEntry) {
    setSelectedEntry(data);
    popupTriggerRef.current?.();
  }

  return (
    <div className="grid grid-cols-7 gap-1 [&>p]:font-medium [&>p]:text-center [&>p]:text-sm [&>p]:text-muted-foreground">
      {showLabel && (
        <>
          <p className="">Mon</p>
          <p className="">Tue</p>
          <p className="">Wed</p>
          <p className="">Thu</p>
          <p className="">Fri</p>
          <p className="">Sat</p>
          <p className="">Sun</p>
        </>
      )}

      {Array.from({ length: startDay }).map((_, index) => (
        <div key={index}></div>
      ))}

      {!loaded ? (
        <PlaceHolderCells count={daysInMonth} />
      ) : Object.values(data).map(entry => (
        <div key={entry.date} className="cursor-pointer hover:scale-90 transition-transform">
          {entry.date == todayDateString
            ? <CalendarCellToday entry={entry} handleClick={handleClick} />
            : <CalendarCell entry={entry} handleClick={handleClick} />
          }
        </div>
      ))}

      <CalendarCellPopup calendarEntry={selectedEntry} trigger={(callback) => {
        popupTriggerRef.current = callback;
        return null;
      }} />
    </div>
  );
}