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
  isEmpty: boolean;
  allCompleted: boolean;
  tileShape: {
    tl: boolean;
    tr: boolean;
    bl: boolean;
    br: boolean;
  };
};

function getCellData(entry: DayEntry): CellData {
  // Count the number of goals completed each day
  const completedTaskCount = entry.goals.filter((goal: Goal) => goal.completed).length;

  return {
    isEmpty: entry.goals.length === 0 || completedTaskCount === 0,
    allCompleted: completedTaskCount === 4,
    tileShape: getTileShapeData(entry.goals)
  };
}

function getTileShapeData(goals: Goal[]): { tl: boolean; tr: boolean; bl: boolean; br: boolean } {
  const priorities: number[] = [];

  goals = goals.sort((a, b) => {
    const aTime = typeof a.created_at === "string" ? Date.parse(a.created_at) : a.created_at;
    const bTime = typeof b.created_at === "string" ? Date.parse(b.created_at) : b.created_at;
    return Number(aTime) - Number(bTime);
  });

  goals.forEach((goal, index) => {
    if (goal.completed) {
      priorities.push(index + 1);
    }
  });

  return {
    tl: priorities.includes(1),
    tr: priorities.includes(2),
    bl: priorities.includes(3),
    br: priorities.includes(4)
  };
}

const partialColor = "bg-neutral-300";
const allCompletedColor = "bg-slate-700";
const backgroundColor = "bg-neutral-100";

export function CalendarCell({ entry }: { entry: DayEntry }) {
  const cell = getCellData(entry);
  const isFutureDate = new Date(entry.date) > new Date();

  return cell.isEmpty ? (
    <div className={cn("flex w-full aspect-square rounded-sm", {
      [backgroundColor]: !isFutureDate
    })}>
      {isFutureDate && (
        <div className="bg-neutral-100 rounded w-2 h-2 m-auto" />
      )}
    </div>
  ) : (
    <div className={cn(`rounded-md p-1`, backgroundColor)}>
      <Tile data={cell.tileShape} foregroundClass={cn({
        [partialColor]: !cell.allCompleted,
        [allCompletedColor]: cell.allCompleted
      })} backgroundClass={backgroundColor} radiusClass="rounded-sm" maxWidth={100}/>
    </div>
  )
}

export function CalendarCellToday({ entry }: { entry: DayEntry }) {
  const [cell, setCell] = useState<CellData>(getCellData(entry));
  const todayDateString = getDateString(new Date());

  // Track today's goals for live changes
  const [goals] = useRealtime<Goal>({
    channelName: 'goal-today-calendar',
    schema: 'public',
    table: 'goal',
    filter: `created_date=eq.${todayDateString}`,
    getInitialData: async () => {
      return entry.goals
    }
  });

  useEffect(() => {
    setCell(getCellData({
      date: todayDateString,
      goals: goals as Goal[]
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goals])

  return cell.isEmpty ? (
    <div className={cn("flex w-full aspect-square rounded-sm", backgroundColor)}></div>
  ) : (
    <div className={cn(`rounded-md p-1`, backgroundColor)}>
      <Tile data={cell.tileShape} foregroundClass={cn({
        [partialColor]: !cell.allCompleted,
        [allCompletedColor]: cell.allCompleted
      })} backgroundClass={backgroundColor} radiusClass="rounded-sm" maxWidth={100}/>
    </div>
  )
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
        const goals = await getGoalsByDate(user.sub, dateString);
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