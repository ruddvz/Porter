"use client";

import { useEffect, useState } from "react";

/** Chromium `beforeinstallprompt` (not in all TS lib configs). */
type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<InstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as InstallPromptEvent);
      if (typeof window !== "undefined" && !localStorage.getItem("pwa-dismissed")) setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
  }, []);

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShow(false);
    setDeferredPrompt(null);
  }

  function dismiss() {
    localStorage.setItem("pwa-dismissed", "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="card fixed bottom-[calc(56px+env(safe-area-inset-bottom))] left-4 right-4 z-50 border-[--accent]/30 p-4 shadow-xl shadow-black/40 md:bottom-4 md:left-auto md:right-4 md:w-96">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[--radius-md] bg-[--accent]">
          <span className="font-mono text-lg font-bold text-black">P</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-sm text-[--text-primary]">Install Porter</p>
          <p className="mt-0.5 text-xs text-[--text-muted]">
            Add to home screen for instant access and push notifications
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-[--text-muted] hover:text-[--text-primary]"
          aria-label="Dismiss install banner"
        >
          ✕
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => void install()} className="btn-primary flex-1 text-xs">
          Install App
        </button>
        <button type="button" onClick={dismiss} className="btn-ghost flex-1 text-xs">
          Not now
        </button>
      </div>
    </div>
  );
}
