import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { OfflineRetry } from "./OfflineRetry";

export const metadata: Metadata = {
  title: "Offline",
  description: "You are offline. Porter needs a connection to sync orders.",
};

export default function OfflinePage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center gap-6 bg-porter-bg-base px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-porter-bg-raised ring-1 ring-porter-bg-border">
        <WifiOff className="h-8 w-8 text-porter-text-secondary" aria-hidden />
      </div>
      <div className="max-w-sm space-y-2">
        <h1 className="text-title text-porter-text-primary">You are offline</h1>
        <p className="text-sm text-porter-text-secondary">
          Porter needs a network connection to load the dashboard and sync orders. Check your connection and try
          again.
        </p>
      </div>
      <OfflineRetry />
    </main>
  );
}
