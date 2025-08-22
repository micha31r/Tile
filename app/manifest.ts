import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Tile",
    short_name: "Tile",
    description: "An app to help you focus on what truly matters. 4 goals, daily check-offs, and friends to keep you motivated.",
    start_url: "/",
    display: "standalone",
    // Let supporting browsers prefer overlay on desktop, fall back to standalone elsewhere
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    capture_links: "existing-client-navigate",
    launch_handler: { client_mode: "navigate-existing" },
    protocol_handlers: [
      { protocol: "web+instapwa", url: "/open?payload=%s" }
    ],
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable any" }
    ],
    screenshots: [
      // Desktop
      {
        src: "/screenshots/wide.png",
        sizes: "2970x1710",
        type: "image/png",
        form_factor: "wide"
      },
      // Mobile
      {
        src: "/screenshots/narrow.png",
        sizes: "1290x2796",
        type: "image/png",
        form_factor: "narrow"
      }
    ]
  } as unknown as MetadataRoute.Manifest;
}
