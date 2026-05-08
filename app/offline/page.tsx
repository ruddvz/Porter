"use client";

import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[--bg-base] text-[--text-secondary]">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[--bg-elevated]">
        <WifiOff className="h-8 w-8 text-[--text-secondary]" aria-hidden />
      </div>
      <h1 className="font-mono text-xl text-[--text-primary]">You&apos;re offline</h1>
      <p className="max-w-xs text-center text-sm">
        Porter needs a connection to sync orders. Check your network and try again.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-[--radius-sm] bg-[--accent] px-4 py-2 font-mono text-sm text-black transition-colors hover:bg-[--accent-dim]"
      >
        Retry
      </button>
    </div>
  );
}
