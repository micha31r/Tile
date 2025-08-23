/// <reference lib="webworker" />

import { Serwist } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache
});

serwist.addEventListeners();

const defaultIcon = "/icons/icon-192.png";

type PushPayload = {
  title?: string;
  body?: string;
  message?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  [key: string]: unknown;
};

self.addEventListener("push", (event: PushEvent) => {
  let data: PushPayload = {};
  try {
    const raw: unknown = event.data 
      ? event.data.json() 
      : {};

    if (raw && typeof raw === "object") {
      data = raw as PushPayload;
    }
  } catch {
    data = {};
  }

  const title = typeof data.title === "string" 
    ? data.title 
    : "Notification";

  // Get content from body or message
  const body =
    typeof data.body === "string"
      ? data.body
      : typeof data.message === "string"
        ? data.message
        : "";

  const icon = typeof data.icon === "string" ? data.icon : defaultIcon;
  const badge = typeof data.badge === "string" ? data.badge : undefined;
  const tag = typeof data.tag === "string" ? data.tag : "push";
  const url = typeof data.url === "string" ? data.url : "/";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon,
      badge,
      tag,
      data: { url }
    })
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const data: unknown = event.notification.data;
  let url = "/app";

  if (data && typeof data === "object" && "url" in data) {
    const maybeUrl = (data as { url?: unknown }).url;

    if (typeof maybeUrl === "string") {
      url = maybeUrl;
    }
  }

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const u = new URL(url, self.location.origin);
        const existing = clientList.find((c) => c.url.includes(u.pathname)) as WindowClient | undefined;

        if (existing) {
          if (existing.url !== u.href) {
            return existing.navigate(u.href).then((c) => (c ?? existing).focus());
          }
          return existing.focus();
        }

        return self.clients.openWindow(u.href);
      })
  );
});
