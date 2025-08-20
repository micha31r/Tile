"use client"

import { CheckIcon, InfoIcon } from "lucide-react";
import { DangerAlert } from "../danger-alert";
import Input from "../input";
import { useContext, useRef, useState } from "react";
import { fallbackTheme, t, Theme, themeOptions } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Profile, updateProfile } from "@/lib/data/profile";
import { ProfileContext } from "./profile-context";

function ThemeSelector({ name, defaultValue }: { name: string; defaultValue?: Theme }) {
  const [value, setValue] = useState<Theme>(defaultValue || fallbackTheme);

  function handleSelection(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const theme = event.currentTarget.value as Theme;
    setValue(theme);
  }

  return (
    <div>
      <div className="grid grid-cols-6 gap-2 w-full">
        {themeOptions.map((theme, index) => (
          <button
            key={index}
            onClick={handleSelection}
            value={theme}
            className={cn(`flex w-full aspect-square rounded-full bg-${theme}-500 scale-90 transition-transform`, {
              "scale-100": value === theme
            })}
          >
            {value === theme && <CheckIcon className="w-6 h-6 m-auto text-white" strokeWidth={2} />}
          </button>
        ))}
      </div>
      <input
        type="text"
        name={name}
        value={value}
        hidden
        readOnly
      />
    </div>
  );
}

export function UserDetailForm({ onSuccess, userId, initialValues }: { onSuccess?: () => void; userId: string; initialValues: Partial<Profile> }) {
  const { profile: { theme } } = useContext(ProfileContext);
  const [error, setError] = useState<string | null>(null);
  const [disabled, setDisabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const firstname = formData.get("firstname");
    const lastname = formData.get("lastname");
    const theme = formData.get("theme");

    setDisabled(true);

    const data = await updateProfile(userId, {
      first_name: firstname?.toString(),
      last_name: lastname?.toString(),
      theme: theme?.toString() || fallbackTheme
    })

    if (!data) {
      setError("Failed to update profile.");
      setDisabled(false);
      return;
    }
    
    setDisabled(false);
    onSuccess?.();
  }

  return (
    <form ref={formRef} name="profile" onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        {error && (
          <DangerAlert>
            <InfoIcon className="w-4 h-4" />
            {error}
          </DangerAlert>
        )}
        <Input type="text" name="firstname" placeholder="First name" defaultValue={initialValues.first_name} />
        <Input type="text" name="lastname" placeholder="Last name" defaultValue={initialValues.last_name} />
      </div>

      <div className="w-full h-px bg-border/50"></div>

      <ThemeSelector name="theme" defaultValue={initialValues.theme} />

      <button disabled={disabled} type="submit" className={cn("disabled:opacity-80 text-white rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform", t("bg", theme, "f"))}>
        Save changes
      </button>
    </form>
  )
}