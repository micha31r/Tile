/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

export default function PwaDebug() {
  const [info, setInfo] = useState<any>({});

  useEffect(() => {
    (async () => {
      const swReady = "serviceWorker" in navigator ? await navigator.serviceWorker.ready.catch(() => null) : null;
      const sub = swReady ? await swReady.pushManager.getSubscription() : null;
      const regs = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistrations() : [];

      setInfo({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine,

        standalone: (navigator as any).standalone ?? false,
        displayMode: window.matchMedia("(display-mode: standalone)").matches,
        visibility: document.visibilityState,

        notifPermission: "Notification" in window ? Notification.permission : "not supported",
        pushManager: "PushManager" in window,
        subscription: sub ? {
          endpoint: sub.endpoint,
          expirationTime: sub.expirationTime,
          keys: sub.toJSON().keys
        } : null,

        swSupported: "serviceWorker" in navigator,
        swController: !!navigator.serviceWorker.controller,
        swReadyScope: swReady?.scope,
        swRegistrations: regs.map(r => ({
          scope: r.scope,
          scriptURL: r.active?.scriptURL
        })),

        manifest: document.querySelector<HTMLLinkElement>('link[rel="manifest"]')?.href ?? "none",

        connection: (navigator as any).connection || "n/a",

        vapidPublic: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });
    })();
  }, []);

  return (
    <div className="p-4 font-mono text-sm whitespace-pre-wrap">
      <h2 className="font-bold mb-2">PWA Debug Info</h2>
      <pre>{JSON.stringify(info, null, 2)}</pre>
    </div>
  );
}
