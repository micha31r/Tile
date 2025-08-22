/// <reference lib="webworker" />

import { Serwist } from "serwist";
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

/* 1 Setup globals */
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}
declare const self: ServiceWorkerGlobalScope;

/* 2 Config you may tweak */
const AUTH_CALLBACK_PREFIX = "/auth/confirm"; // your server callback path
const SUCCESS_PATH = "/app";                     // final path after successful login
const SUCCESS_HEADER = "x-auth-event";        // optional success header name
const SUCCESS_HEADER_VALUE = "login";         // optional success header value

/* 3 Initialise Serwist */
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache
});
serwist.addEventListeners();

/* 4 Never cache auth routes and intercept the callback navigation */
self.addEventListener("fetch", (event: FetchEvent) => {
  const url = new URL(event.request.url);

  // Intercept navigations to the auth confirm route to detect success and notify clients
  if (event.request.mode === "navigate" && url.pathname.startsWith(AUTH_CALLBACK_PREFIX)) {
    event.respondWith(handleAuthCallbackNavigation(event));
    return;
  }

  // Treat all auth paths as NetworkOnly to avoid caching redirects or HTML
  if (url.pathname.startsWith("/auth/")) {
    event.respondWith(fetch(event.request));
  }
});

/* 5 Let the server set cookies and redirect, then broadcast login to all windows */
async function handleAuthCallbackNavigation(event: FetchEvent): Promise<Response> {
  // Always go to network so the server can do the exchange and set cookies
  const response = await fetch(event.request);

  // After network completes, decide if login looks successful and broadcast to clients
  event.waitUntil((async () => {
    try {
      const finalUrl = new URL(response.url);
      const byHeader =
        response.headers.get(SUCCESS_HEADER)?.toLowerCase() === SUCCESS_HEADER_VALUE;
      const byLocation = response.redirected && finalUrl.pathname === SUCCESS_PATH;
      const looksSuccessful = byHeader || byLocation || response.ok;

      if (looksSuccessful) {
        const clientsList = await self.clients.matchAll({
          type: "window",
          includeUncontrolled: true
        });
        for (const client of clientsList) {
          client.postMessage({ type: "login" });
        }
      }
    } catch {
      // ignore errors
    }
  })());

  // Continue normal navigation
  return response;
}
