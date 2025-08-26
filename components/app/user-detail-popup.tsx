"use client";

import { useContext, useRef } from "react";
import { Popup } from "./popup";
import { UserDetailForm } from "./user-detail-form";
import { ProfileContext } from "./profile-context";
import { WarningAlert } from "../warning-alert";
import { TriangleAlertIcon } from "lucide-react";
import { useHaptic } from "react-haptic";
import { DeleteAccountPopup } from "./delete-account-popup";

export function UserDetailPopup({ children }: { children?: React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const { profile } = useContext(ProfileContext);
  const deleteAccountPopupTrigger = useRef<(() => void) | null>(null);
  const { vibrate } = useHaptic();

  function handleOpenDeleteAccountPopup(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    vibrate();
    deleteAccountPopupTrigger.current?.();
  }

  const deleteAccountPopup = <DeleteAccountPopup trigger={(callback) => {
    deleteAccountPopupTrigger.current = callback;
    return null;
  }} />;

  return (
    <>
      <Popup
        title="Update profile"
        trigger={(callback) => {
          popupTriggerRef.current = callback;
          return <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{children}</div>;
        }}
      >
        <div className="space-y-4">
          <UserDetailForm initialValues={profile} onSuccess={() => {
            popupTriggerRef.current?.();
          }} />
        </div>
        <div className="space-y-2 mt-4">
          <h4 className="font-medium">Delete account</h4>
          <WarningAlert>
            <TriangleAlertIcon />
            This action cannot be undone
          </WarningAlert>
          <button onClick={handleOpenDeleteAccountPopup} className="disabled:opacity-80 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
            Delete account
          </button>
        </div>
      </Popup>

      {deleteAccountPopup}
    </>
  );
}