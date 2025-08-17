"use client"

import { useRef } from "react";
import { GoalForm } from "./goal-form";
import { Popup } from "./popup";

export function RecordGoalPopup() {
  const popupTriggerRef = useRef<(() => void) | null>(null);

  return (
    <Popup
      title="Create new goal"
      trigger={(callback) => {
        popupTriggerRef.current = callback;

        return (
          <button
            onClick={callback}
            type="submit"
            className="bg-blue-700 disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform"
          >
            Record today&apos;s goals
          </button>
        );
      }}
    >
      <GoalForm onSuccess={() => popupTriggerRef.current && popupTriggerRef.current()} />
    </Popup>
  );
}