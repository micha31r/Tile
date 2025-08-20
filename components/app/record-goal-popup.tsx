"use client"

import { useContext, useRef } from "react";
import { GoalForm } from "./goal-form";
import { Popup } from "./popup";
import { cn } from "@/lib/utils";
import { ProfileContext } from "./profile-context";
import { t } from "@/lib/theme";

export function RecordGoalPopup() {
  const { profile: { theme } } = useContext(ProfileContext);
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
            className={cn("disabled:opacity-80 text-white rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform", t("bg", theme, "f"))}
          >
            Set today&apos;s goals
          </button>
        );
      }}
    >
      <GoalForm onSuccess={() => popupTriggerRef.current && popupTriggerRef.current()} />
    </Popup>
  );
}