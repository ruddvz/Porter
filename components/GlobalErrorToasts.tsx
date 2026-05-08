"use client";

import { useToast } from "@/components/ui/Toast";
import { useEffect } from "react";

export function GlobalErrorToasts() {
  const { push } = useToast();

  useEffect(() => {
    function onUnhandled(e: PromiseRejectionEvent) {
      console.error("[unhandledrejection]", e.reason);
      const msg =
        e.reason != null && typeof e.reason === "object" && "message" in e.reason && typeof (e.reason as Error).message === "string"
          ? (e.reason as Error).message
          : typeof e.reason === "string"
            ? e.reason
            : "Something went wrong. Please try again.";
      push(msg, "error");
    }
    window.addEventListener("unhandledrejection", onUnhandled);
    return () => window.removeEventListener("unhandledrejection", onUnhandled);
  }, [push]);

  return null;
}
