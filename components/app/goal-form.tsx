"use client"

import { InfoIcon } from "lucide-react";
import { DangerAlert } from "../danger-alert";
import Input from "../input";
import TextArea from "../textarea";
import { useRef, useState } from "react";
import { WarningAlert } from "../warning-alert";
import { createGoal } from "@/lib/data/goal";
import { getTodayDateString } from "@/lib/utils";

export function GoalForm({ onSuccess }: { onSuccess?: () => void }) {
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name");
    const details = formData.get("details");

    if (!name || name.toString().length < 6) {
      setError("Title must be at least 6 characters long.");
      return;
    }

    setDisabled(true);

    const data = await createGoal({
      name: name.toString(),
      details: details?.toString(),
      created_date: getTodayDateString(),
    });

    if (!data) {
      setError("Failed to create goal.");
      setDisabled(false);
      return;
    }
    
    setDisabled(false);
    formRef.current?.reset();
    onSuccess?.();
  }

  return (
    <form ref={formRef} name="add-goal" onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <WarningAlert>
          <InfoIcon className="w-4 h-4" />
          Goals cannot be edited later.
        </WarningAlert>
        {error && (
          <DangerAlert>
            <InfoIcon className="w-4 h-4" />
            {error}
          </DangerAlert>
        )}
        <Input type="text" name="name" placeholder="Name" />
        <TextArea name="details" className="resize-none" placeholder="What is it about?" rows={3} />
      </div>
      <button disabled={disabled} type="submit" className="bg-blue-700 disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
        Add new goal
      </button>
    </form>
  )
}