"use client"

import { useMemo, useRef } from "react";
import { Popup } from "./popup";
import { InfoIcon } from "lucide-react";
import { getDisplayDateString } from "@/lib/utils";
import { DangerAlert } from "../danger-alert";
import { GoalItem } from "./goal-list";
import { Goal } from "@/lib/data/goal";
import { DayEntry } from "./calendar-month";
import { InfoAlert } from "../info-alert";
import { WarningAlert } from "../warning-alert";

export function GoalDetailPopup({ goal, trigger }: { goal: Goal; trigger: (onClick: () => void) => React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);

  return (
    <Popup
      title="Goal details"
      trigger={(callback) => {
        popupTriggerRef.current = callback;
        const triggerNode = trigger(callback);
        return triggerNode
          ? <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{triggerNode}</div>
          : null;
      }}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Name</h4>
          <p>{goal.name}</p>
        </div>

        {goal.details && (
          <>
            <div className="w-full h-px bg-border/50"></div>
            <div className="space-y-2">
              <h4 className="font-medium">Description</h4>
              <p>{goal.details}</p>
            </div>
          </>
        )}
        
        {goal.reflection && (
          <>
            <div className="w-full h-px bg-border/50"></div>
            <div className="space-y-2">
              <h4 className="font-medium">Reflection</h4>
              <p>{goal.reflection}</p>
            </div>
          </>
        )}

        {!goal.details && !goal.reflection && (
          <InfoAlert>
            <InfoIcon />
            No details or reflection provided
          </InfoAlert>
        )}

        <button onClick={() => popupTriggerRef.current?.()} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
          Close
        </button>
      </div>
    </Popup>
  );
}

export function CalendarCellPopup({ calendarEntry, children }: { calendarEntry: DayEntry, children?: React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const triggers = useRef<(() => void)[]>([]);
  const items = useMemo(() => {
    triggers.current = Array(calendarEntry.goals.length).fill(undefined);
    return calendarEntry.goals.map((goal, index) => (
      <GoalDetailPopup key={index} goal={goal} trigger={(callback) => {
        triggers.current[index] = callback;
        return null;
      }} />
    ));
  }, [calendarEntry.goals]);

  const goalsCompleted = calendarEntry.goals.reduce((count, goal) => goal.completed ? count + 1 : count, 0)
  const isFutureDate = new Date(calendarEntry.date) > new Date(new Date().setHours(23, 59, 59, 999));

  let alert;

  if (isFutureDate) {
    alert = (
      <InfoAlert>
        <InfoIcon />
        Future date
      </InfoAlert>
    )
  } else if (calendarEntry.goals.length === 0) {
    alert = (
      <DangerAlert>
        <InfoIcon />
        No goals were set
      </DangerAlert>
    )
  } else if (goalsCompleted === 0) {
    alert = (
      <DangerAlert>
        <InfoIcon />
        Goals were set, but none completed
      </DangerAlert>
    )
  } else if (goalsCompleted < 4) {
    alert = (
      <WarningAlert>
        <InfoIcon />
        Fewer than 4 goals were completed
      </WarningAlert>
    )
  } else {
    alert = (
      <InfoAlert>
        <InfoIcon />
        All goals were completed
      </InfoAlert>
    )
  }

  return (
    <>
      <Popup
        title={`${getDisplayDateString(new Date(calendarEntry.date))}`}
        trigger={(callback) => {
          popupTriggerRef.current = callback;
          return <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{children}</div>;
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {alert}

            {calendarEntry.goals.length > 0 && (
              <div className="space-y-2">
                {calendarEntry.goals.map((goal, index) => (
                  <div key={index} onClick={() => triggers.current[index]?.()} className="hover:scale-95 transition-transform cursor-pointer">
                    <GoalItem goal={goal} priority={index + 1} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => popupTriggerRef.current?.()} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
            Close
          </button>
        </div>
      </Popup>

      {items}
    </>
  );
}