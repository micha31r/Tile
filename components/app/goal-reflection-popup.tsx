"use client"

import { useRef } from "react";
import { Popup } from "./popup";
import { Goal } from "@/lib/data/goal";
import { ReflectionForm } from "./reflection-form";

export function GoalReflectionPopup({ goal, children }: { goal: Goal, children?: React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);

  return (
    <Popup
      title={goal.name}
      trigger={(callback) => {
        popupTriggerRef.current = callback;
        return <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{children}</div>;
      }}
    >
      <div className="space-y-4">
        {goal.details && (
          <p className="text-muted-foreground text-sm">{goal.details}</p>
        )}

        <ReflectionForm goal={goal} onSuccess={() => {
          popupTriggerRef.current?.();
        }} />
      </div>
    </Popup>
  );
}