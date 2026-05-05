"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Seller } from "@/types";
import { useState } from "react";

export default function PushPrompt({ seller }: { seller: Seller }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  if (seller.plan !== "growth" || done) return null;

  async function subscribe() {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) return;
    setBusy(true);
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setBusy(false);
      return;
    }
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid),
    });
    const body = sub.toJSON();
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: body.endpoint, keys: body.keys }),
    });
    setBusy(false);
    if (res.ok) setDone(true);
  }

  return (
    <Card padding="sm" className="border-porter-bg-border bg-porter-bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-porter-text-secondary">Enable notifications for new orders (Growth).</p>
        <Button type="button" size="sm" loading={busy} onClick={() => void subscribe()}>
          Enable
        </Button>
      </div>
    </Card>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
