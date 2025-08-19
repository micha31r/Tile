"use client"

import { cn, getDateString } from "@/lib/utils";
import { Tile } from "../tile/tile";
import { getGoalsByDate, Goal } from "@/lib/data/goal";
import { useRealtime } from "../use-realtime";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

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
  let completedTaskCount = 0;
  const prioritiesSet = new Set<number>();

  for (const goal of entry.goals) {
    if (goal.completed) completedTaskCount++;
    prioritiesSet.add(goal.priority);
  }

  let status: CellStatus;

  if (entry.goals.length === 0) {
    status = "unset";
  } else if (completedTaskCount === 0) {
    status = "set";
  } else if (completedTaskCount < 4) {
    status = "partial";
  } else {
    status = "complete";
  }

  return {
    status: status,
    tileShape: getTileData(prioritiesSet)
  };
}

function getTileData(priorities: Set<number>) {
  return {
    tl: priorities.has(1),
    tr: priorities.has(2),
    bl: priorities.has(3),
    br: priorities.has(4)
  };
}

const partialColor = "bg-neutral-300";
const allCompletedColor = "bg-slate-700";
const backgroundColor = "bg-neutral-100";
const borderColor = "border-neutral-100";

export function CalendarCell({ entry }: { entry: DayEntry }) {
  const cell = getCellData(entry);
  const isFutureDate = new Date(entry.date) > new Date();

  if (cell.status === "unset") {
    return (
      <div className={cn("flex w-full aspect-square rounded-md", {
        [backgroundColor]: !isFutureDate,
        [`border-2 ${borderColor}`]: isFutureDate
      })}>
      </div>
    )
  } else if (cell.status === "set") {
    return (
      <div className={cn("flex w-full aspect-square rounded-md", {
        [backgroundColor]: !isFutureDate,
        [`border-2 ${borderColor}`]: isFutureDate
      })}></div>
    )
  } else {
    return (
      <div className={cn(`rounded-md p-1`, backgroundColor)}>
        <Tile data={cell.tileShape} foregroundClass={cn({
          [partialColor]: cell.status === "partial",
          [allCompletedColor]: cell.status === "complete"
        })} backgroundClass={backgroundColor} radiusClass="rounded-sm" maxWidth={100}/>
      </div>
    )
  }
}

export function CalendarCellToday({ entry }: { entry: DayEntry }) {
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
      return entry.goals
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
  }, [goals])

  console.log(cell.status)

  if (cell.status === "unset") {
    return (
      <div className={cn("flex w-full aspect-square rounded-sm")}></div>
    )
  } else if (cell.status === "set") {
    return (
      <div className={cn("flex w-full aspect-square rounded-sm")}></div>
    )
  } else {
    return (
      <div className={cn(`rounded-md p-1`, backgroundColor)}>
        <Tile data={cell.tileShape} foregroundClass={cn({
          [partialColor]: cell.status === "partial",
          [allCompletedColor]: cell.status === "complete"
        })} backgroundClass={backgroundColor} radiusClass="rounded-sm" maxWidth={100}/>
      </div>
    )
  }
}

function PlaceHolderCells({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <CalendarCell entry={{ date: '0000-00-00', goals: [] } as unknown as DayEntry} />
        </div>
      ))}
    </>
  )
}

export function CalendarMonth({ month, year, showLabel = false }: { month: Month; year: number; showLabel?: boolean }) {
  const daysInMonth = new Date(year, month - 1, 0).getDate();
  const startDay = new Date(year, month - 1, 0).getDay();
  const [data, setData] = useState<CalendarMonthData>({});
  const [loaded, setLoaded] = useState(false)

  const todayDateString = getDateString(new Date());

  async function getCalendarData() {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims) {
      return {};
    }

    const user = data.claims;
    const goalData: CalendarMonthData = {};
    await Promise.all(
      Array.from({ length: daysInMonth }, async (_, i) => {
        const day = i + 1;
        const date = new Date(year, month - 1, day);
        const dateString = getDateString(date);
        const goals = await getGoalsByDate(user.sub, date);
        goalData[dateString] = { date: dateString, goals };
      })
    );
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

  return (
    <div className="grid grid-cols-7 gap-1 text-center font-medium text-sm text-muted-foreground">
      {showLabel && (
        <>
          <div className="">Mon</div>
          <div className="">Tue</div>
          <div className="">Wed</div>
          <div className="">Thu</div>
          <div className="">Fri</div>
          <div className="">Sat</div>
          <div className="">Sun</div>
        </>
      )}

      {Array.from({ length: startDay }).map((_, index) => (
        <div key={index}></div>
      ))}

      {!loaded ? (
        <PlaceHolderCells count={daysInMonth} />
      ) : Object.values(data).map(entry => (
          entry.date == todayDateString ? (
            <CalendarCellToday key={entry.date} entry={entry} />
          ) : (
            <CalendarCell key={entry.date} entry={entry} />
          )
      ))}
    </div>
  );
}