"use client";

import { InfoIcon } from "lucide-react";
import { DangerAlert } from "../danger-alert";
import TextArea from "../textarea";
import { useContext, useRef, useState } from "react";
import { WarningAlert } from "../warning-alert";
import { Goal, markGoalAsCompleted } from "@/lib/data/goal";
import { createGoalBroadcast } from "@/lib/data/broadcast";
import { cn, getDisplayName, getTodayRangeAsUTC } from "@/lib/utils";
import { t } from "@/lib/theme";
import { ProfileContext } from "./profile-context";
import { useHaptic } from "react-haptic";
import sendPushNotification from "@/lib/data/push";

export function ReflectionForm({ goal, onSuccess }: { goal: Goal, onSuccess?: () => void }) {
  const { profile, userId } = useContext(ProfileContext);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { vibrate } = useHaptic();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    vibrate();

    const formData = new FormData(event.currentTarget);
    const reflection = formData.get("reflection");

    setDisabled(true);

    const data = await markGoalAsCompleted(goal.id, reflection?.toString() || null);

    // Broadcast changes
    const [startUTC, endUTC] = getTodayRangeAsUTC();
    await createGoalBroadcast(userId, startUTC, endUTC);

    // Send notifications
    const result = await sendPushNotification(
      userId,
      `${getDisplayName(profile.first_name, profile.last_name) || "Friend activity"}`,
      `You friend has just completed a goal.`
    );

    console.log(`Notifictions: ${JSON.stringify(result)}`);

    if (!data) {
      setError("Failed to mark goal as completed");
      setDisabled(false);
      return;
    }
    
    setDisabled(false);
    formRef.current?.reset();
    onSuccess?.();
  }

  return (
    <form ref={formRef} name="goal-reflection" onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <WarningAlert>
          <InfoIcon className="w-4 h-4" />
          Cannot be changed once completed
        </WarningAlert>
        {error && (
          <DangerAlert>
            <InfoIcon className="w-4 h-4" />
            {error}
          </DangerAlert>
        )}
        <TextArea name="reflection" className="resize-none" placeholder="Any throughts?" rows={3} />
      </div>
      <button disabled={disabled} type="submit" className={cn("disabled:opacity-80 text-white rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform", t("bg", profile.theme, "f"))}>
        Mark as completed
      </button>
    </form>
  );
}