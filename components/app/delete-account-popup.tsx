import { InfoIcon, TriangleAlertIcon } from "lucide-react";
import { DangerAlert } from "../danger-alert";
import { Popup } from "./popup";
import Input from "../input";
import { createClient } from "@/lib/supabase/client";
import { useHaptic } from "react-haptic";
import { useContext, useRef, useState } from "react";
import { ProfileContext } from "./profile-context";
import { unregisterPush } from "../logout-button";
import { WarningAlert } from "../warning-alert";
import { useRouter } from "next/navigation";

export function DeleteAccountPopup({ trigger }: { trigger: (onClick: () => void) => React.ReactNode }) {
  const { email } = useContext(ProfileContext);
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const [disabled, setDisabled] = useState(false);
  const { vibrate } = useHaptic();
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setDisabled(true);
    vibrate();

    if (inputRef.current?.value !== email) {
      setDisabled(false);
      setErrorMessage("Email does not match");
      return;
    }

    const { error } = await supabase.rpc("purge_current_user");
    if (error) {
      router.push(`/app?error=Failed to delete account`);
      setDisabled(false);
    } else {
      unregisterPush();
      await supabase.auth.signOut();
      window.location.href = `/auth/login?success=Your account and all related data has been deleted`;
    }
  }

  async function handleCancel() {
    setDisabled(false);
    setErrorMessage(null);
    popupTriggerRef.current?.();
    inputRef.current!.value = "";
  }

  return (
    <Popup
      title="Delete Account"
      trigger={(callback) => {
        popupTriggerRef.current = callback;
        return trigger(callback);
      }}
    >
      <div className="space-y-4">
        <DangerAlert>
          <TriangleAlertIcon />
          This will permanently delete your account and all related data.
        </DangerAlert>

        {errorMessage && (
          <WarningAlert>
            <InfoIcon />
            Email does not match
          </WarningAlert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Confirm email to proceed</h4>
          <Input ref={inputRef} type="text" name="confirm-email" placeholder="Confirm email" />
        </div>

        <div className="flex gap-3">
          <button onClick={handleCancel} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
            Cancel
          </button>
          <button disabled={disabled} onClick={handleDelete} className="disabled:opacity-80 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
            Delete
          </button>
        </div>
      </div>
    </Popup>
  );
}