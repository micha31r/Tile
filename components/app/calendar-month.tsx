import { cn } from "@/lib/utils";
import { Tile } from "../tile/tile";

type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

type TaskPriority = 1 | 2 | 3 | 4

type Task = {
  id: string;
  content: string;
  completed: boolean;
  priority: TaskPriority;
}

type DayEntry = {
  tasks: Task[]
};

export type CalendarMonthData = DayEntry[]

function getTileShapeData(tasks: Task[]): { tl: boolean; tr: boolean; bl: boolean; br: boolean } {
  const priorities: number[] = [];
  
  tasks.forEach(task => {
    if (task.completed) {
      priorities.push(task.priority);
    }
  });

  return {
    tl: priorities.includes(1),
    tr: priorities.includes(2),
    bl: priorities.includes(3),
    br: priorities.includes(4)
  };
}

function shuffleArray(array: unknown[]) {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateTestData(days: number): CalendarMonthData {
  const data: CalendarMonthData = [];
  for (let i = 1; i <= days; i++) {
    const tasks: Task[] = []

    if (Math.random() > 0.2) {
      const priorities = shuffleArray(Array.from({ length: 4 }, (_, i) => i));
      priorities.forEach(val => {
        tasks.push({
          id: "123",
          content: "123",
          completed: Math.random() > 0.15,
          priority: (val as number + 1) as TaskPriority
        })
      })
    }

    data.push({ 
      tasks
    })
  }

  return data
}

export function CalendarMonth({ month, year, showLabel = false }: { month: Month; year: number; showLabel?: boolean }) {
  const daysInMonth = new Date(year, month - 1, 0).getDate();
  const startDay = new Date(year, month - 1, 0).getDay();

  // Generate data
  const data = generateTestData(daysInMonth);

  const cells = data.map(({ tasks }) => {
    const completedTaskCount = tasks.filter(task => task.completed).length;
    return {
      isEmpty: tasks.length === 0 || completedTaskCount == 0,
      allCompleted: completedTaskCount === tasks.length,
      tileShape: getTileShapeData(tasks)
    };
  });

  const partialColor = "bg-neutral-300";
  const allCompletedColor = "bg-slate-700";
  const backgroundColor = "bg-neutral-100";

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

      {Array.from({ length: startDay }).map((_, rowIndex) => (
        <div key={rowIndex}></div>
      ))}

      {cells.map((cell, index) => (
        cell.isEmpty ? (
          <div key={index} className={cn("flex w-full aspect-square rounded-sm", backgroundColor)}>
            {/* <div className="bg-neutral-300 rounded w-2 h-2 m-auto" /> */}
          </div>
        ) : (
          <div key={index} className={cn(`rounded-md p-1`, backgroundColor)}>
            <Tile data={cell.tileShape} foregroundClass={cn({
              [partialColor]: !cell.allCompleted,
              [allCompletedColor]: cell.allCompleted
            })} backgroundClass={backgroundColor} radiusClass="rounded-sm" maxWidth={100}/>
          </div>
        )
      ))}
    </div>
  );
}