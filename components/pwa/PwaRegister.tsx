"use client";

import { withBasePath } from "@/lib/base-path";
import { useEffect } from "react";

/**
 * Registers the static service worker at /sw.js (respects basePath on GitHub Pages).
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    const url = `${withBasePath("/sw.js")}`;
    const scope = `${withBasePath("/")}`;
    navigator.serviceWorker
      .register(url, { scope })
      .catch(() => {
        /* ignore — e.g. localhost without HTTPS in some browsers */
      });
  }, []);
  return null;
}
