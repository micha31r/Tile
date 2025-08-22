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

// 1) Serwist bootstrap
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache
});
serwist.addEventListeners();

// 2) Settings you can tweak
const AUTH_CALLBACK_PREFIX = "/api/auth/callback";
const SUCCESS_PATH = "/"; // where your server finally redirects after success
const SUCCESS_HEADER = "x-auth-event"; // optional: set this on success response
const SUCCESS_HEADER_VALUE = "login";

// 3) Never cache auth navigations (belt and braces)
self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // Only care about navigations hitting your auth callback route
  if (event.request.mode === "navigate" && url.pathname.startsWith(AUTH_CALLBACK_PREFIX)) {
    event.respondWith(handleAuthCallbackNavigation(event));
    return;
  }

  // If you also call auth endpoints via fetch/XHR, keep them NetworkOnly as well
  if (url.pathname.startsWith("/api/auth/") && event.request.method === "GET") {
    event.respondWith(fetch(event.request)); // no caching
  }
});

// 4) Let server run exchange, then broadcast "login" to all clients if it looks successful
async function handleAuthCallbackNavigation(event: FetchEvent): Promise<Response> {
  const response = await fetch(event.request); // allow redirects; server sets cookies

  event.waitUntil((async () => {
    try {
      const finalURL = new URL(response.url);
      const byHeader =
        response.headers.get(SUCCESS_HEADER)?.toLowerCase() === SUCCESS_HEADER_VALUE;

      const byLocation = response.redirected && finalURL.pathname === SUCCESS_PATH;
      const looksSuccessful = byHeader || byLocation || response.ok;

      if (looksSuccessful) {
        const all = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of all) client.postMessage({ type: "login" });
      }
    } catch {
      // ignore
    }
  })());

  return response;
}
