"use client"

import { useEffect, useRef } from "react";
import { Popup } from "./popup";
import { InfoAlert } from "../info-alert";
import { CheckIcon, InfoIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { DangerAlert } from "../danger-alert";

export function StatusMessagePopup() {
  const popupTriggerRef = useRef<(() => void) | null>(null);
  const searchParams = useSearchParams();
  const successMessage = searchParams.get("success");
  const errorMessage = searchParams.get("error");

  useEffect(() => {
    if (successMessage || errorMessage) {
      popupTriggerRef.current?.();
      
      // Remove search params
      window.history.replaceState({}, '', window.location.pathname);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popupTriggerRef.current]);

  const title = successMessage ? "Success" : errorMessage ? "An error has occured" : "Status";

  return (
    <Popup title={title} trigger={(onClick) => {
      popupTriggerRef.current = onClick;
      return null;
    }}>
      <div className="space-y-4">
        {successMessage && (
          <InfoAlert>
            <CheckIcon />
            {successMessage}
          </InfoAlert>
        )}

        {errorMessage && (
          <DangerAlert>
            <InfoIcon />
            {errorMessage}
          </DangerAlert>
        )}

        <button onClick={() => popupTriggerRef.current?.()} className="bg-foreground disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
          Done
        </button>
      </div>
    </Popup>
  );
}