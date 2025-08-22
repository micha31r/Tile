"use client";

import { useContext, useRef } from "react";
import { Popup } from "./popup";
import { UserDetailForm } from "./user-detail-form";
import { ProfileContext } from "./profile-context";

export function UserDetailPopup({ children }: { children?: React.ReactNode }) {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const { profile } = useContext(ProfileContext);

  return (
    <Popup
      title="Update profile"
      trigger={(callback) => {
        popupTriggerRef.current = callback;
        return <div className="cursor-pointer hover:scale-95 transition-transform" onClick={callback}>{children}</div>;
      }}
    >
      {profile && (
        <div className="space-y-4">
          <UserDetailForm initialValues={profile} onSuccess={() => {
            popupTriggerRef.current?.();
          }} />
        </div>
      )}
    </Popup>
  );
}