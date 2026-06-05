"use client";

import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";

export default function PWAUpdateBanner() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const onController = () => {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (!reg) return;
        reg.addEventListener("updatefound", () => {
          const sw = reg.installing;
          if (!sw) return;
          sw.addEventListener("statechange", () => {
            if (sw.state === "installed" && navigator.serviceWorker.controller) {
              setWaiting(reg.waiting ?? sw);
            }
          });
        });
        if (reg.waiting) setWaiting(reg.waiting);
      });
    };
    onController();
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload());
  }, []);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className="safe-bottom fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 mx-auto max-w-lg rounded-xl border border-porter-green-500/40 bg-porter-bg-elevated px-4 py-3 shadow-raised lg:bottom-6 lg:left-auto lg:right-6"
    >
      <p className="text-sm font-medium text-porter-text-primary">Update available — refresh to get the latest Porter.</p>
      <Button
        type="button"
        size="sm"
        className="mt-2"
        onClick={() => {
          waiting.postMessage({ type: "SKIP_WAITING" });
        }}
      >
        Refresh now
      </Button>
    </div>
  );
}
