import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Porter",
    short_name: "Porter",
    description: "WhatsApp-first order management for local shops",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0A0F0D",
    theme_color: "#0A0F0D",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
