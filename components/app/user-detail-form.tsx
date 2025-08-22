"use client";

import { CheckIcon, InfoIcon } from "lucide-react";
import { DangerAlert } from "../danger-alert";
import Input from "../input";
import React, { useContext, useEffect, useRef, useState } from "react";
import { fallbackTheme, t, Theme, themeOptions } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Profile, updateProfile } from "@/lib/data/profile";
import { ProfileContext } from "./profile-context";
import { InfoAlert } from "../info-alert";
import MobileDetect from "mobile-detect";
import { useHaptic } from "react-haptic";

function ThemeSelector({ name, defaultValue }: { name: string; defaultValue?: Theme }) {
  const [value, setValue] = useState<Theme>(defaultValue || fallbackTheme);
  const { vibrate } = useHaptic();

  function handleSelection(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const theme = event.currentTarget.value as Theme;
    setValue(theme);
    vibrate();
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

function Select({ name, defaultValue, options }: { name: string; defaultValue?: Theme; options: string[] }) {
  const { profile: { theme } } = useContext(ProfileContext);
  const [value, setValue] = useState<Theme>(defaultValue || fallbackTheme);
  const { vibrate } = useHaptic();

  function handleSelection(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    const theme = event.currentTarget.value as Theme;
    setValue(theme);
    vibrate();
  }

  return (
    <div>
      <div className="space-y-1 w-full rounded-2xl bg-secondary p-2 overflow-y-auto max-h-60">
        {options.map((item, index) => (
          <React.Fragment key={index}>
            {index !== 0 && (
              <div className="px-3">
                <div className="w-full h-px bg-white/10"></div>
              </div>
            )}
            <button
              onClick={handleSelection}
              value={item}
              className={cn(`flex justify-between items-center gap-2 p-2 py-1.5 w-full rounded-xl transition-all cursor-pointer hover:scale-95`, {
                [`text-white ${t("bg", theme, "f")}`]: value === item,
                [`hover:bg-neutral-200 hover:dark:bg-neutral-700`]: value !== item
              })}
              >
              <span className="flex-1 text-left">{item}</span>
              {value === item && <CheckIcon className="w-5 h-5 m-auto text-white" strokeWidth={2} />}
            </button>
          </React.Fragment>
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
  const [rerender, setRerender] = useState(0);
  const [isIOS, setIsIOS] = useState(false);
  const { vibrate } = useHaptic();
  
  useEffect(() => {
    const md = new MobileDetect(window.navigator.userAgent);
    setIsIOS(md.is("iPhone") || md.is("iPad") || md.os() === "iOS");
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    vibrate();

    const formData = new FormData(event.currentTarget);
    const firstname = formData.get("firstname");
    const lastname = formData.get("lastname");
    const theme = formData.get("theme");
    const timezone = formData.get("timezone");

    setDisabled(true);

    const data = await updateProfile(userId, {
      first_name: firstname?.toString(),
      last_name: lastname?.toString(),
      theme: theme?.toString() || fallbackTheme,
      timezone: timezone?.toString() || "Australia/Melbourne"
    });

    if (!data) {
      setError("Failed to update profile.");
      setDisabled(false);
      return;
    }
    
    setDisabled(false);
    onSuccess?.();
  }

  function handleCancel(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    onSuccess?.();
    setRerender(prev => prev + 1);
    formRef.current?.reset();
  }

  const timezoneOptions = Intl.supportedValuesOf("timeZone");

  return (
    <form ref={formRef} name="profile" onSubmit={handleSubmit} className="space-y-4">
      <ThemeSelector key={rerender} name="theme" defaultValue={initialValues.theme} />

      <div className="w-full h-px bg-border/50"></div>

      {/* <div className="space-y-3"> */}
        {error && (
          <DangerAlert>
            <InfoIcon className="w-4 h-4" />
            {error}
          </DangerAlert>
        )}
        <div className="space-y-2">
          <h4 className="font-medium">Display name</h4>
          <div className="grid grid-cols-2 gap-3">
            <Input type="text" name="firstname" placeholder="First name" defaultValue={initialValues.first_name} />
            <Input type="text" name="lastname" placeholder="Last name" defaultValue={initialValues.last_name} />
          </div>
        </div>

         <div className="space-y-2">
          <h4 className="font-medium">Timezone</h4>
          <InfoAlert>
            <InfoIcon />
            Timezone for email notifications
          </InfoAlert>
          <Select key={rerender} name="timezone" defaultValue={initialValues.timezone} options={timezoneOptions} />
        </div>
      {/* </div> */}

      <div className={cn("flex gap-3 sticky bottom-4 shadow-[0_0_0_16px_hsla(var(--background))] bg-background", {
        "bottom-8 shadow-[0_16px_0_32px_hsla(var(--background))]": isIOS
      })}>
        <button onClick={handleCancel} className="text-background bg-foreground rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
          Cancel
        </button>
        <button disabled={disabled} type="submit" className={cn("disabled:opacity-80 text-white rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform", t("bg", theme, "f"))}>
          Save changes
        </button>
      </div>
    </form>
  );
}