"use client"

import { InfoIcon } from "lucide-react";
import { DangerAlert } from "../danger-alert";
import TextArea from "../textarea";
import { useRef, useState } from "react";
import { WarningAlert } from "../warning-alert";
import { Goal, markGoalAsCompleted } from "@/lib/data/goal";
import { createGoalBroadcast } from "@/lib/data/broadcast";

export function ReflectionForm({ goal, onSuccess }: { goal: Goal, onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const reflection = formData.get("reflection");

    setDisabled(true);

    const data = await markGoalAsCompleted(goal.id, reflection?.toString() || null);

    // Broadcast changes
    await createGoalBroadcast(goal.user_id, new Date());

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
      <button disabled={disabled} type="submit" className="bg-blue-700 disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
        Mark as completed
      </button>
    </form>
  )
}