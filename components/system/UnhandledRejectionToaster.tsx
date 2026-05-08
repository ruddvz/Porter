"use client";

import { useToast } from "@/components/ui/Toast";
import { useEffect } from "react";

/** Plan0 §18 — surface unhandled promise rejections instead of failing silently. */
export function UnhandledRejectionToaster() {
  const { push } = useToast();

  useEffect(() => {
    const onRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const message =
        reason instanceof Error
          ? reason.message || "Something went wrong"
          : typeof reason === "string"
            ? reason
            : "Something went wrong";
      push(message, "error");
    };
    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
  }, [push]);

  return null;
}
