"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Seller } from "@/types";
import Link from "next/link";
import { useState } from "react";

type PushVariant = "banner" | "settings";

export default function PushPrompt({ seller, variant = "banner" }: { seller: Seller; variant?: PushVariant }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function subscribe() {
    setErr(null);
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) return;
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      setErr("VAPID keys are not configured for this deployment.");
      return;
    }
    setBusy(true);
    const perm = await Notification.requestPermission();
    if (perm !== "granted") {
      setBusy(false);
      setErr("Notification permission was not granted.");
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
    const j = (await res.json().catch(() => ({}))) as { error?: { message?: string } | null };
    setBusy(false);
    if (!res.ok || j.error) {
      setErr(j.error?.message ?? "Subscribe failed");
      return;
    }
    setDone(true);
  }

  if (variant === "banner") {
    if (seller.plan !== "growth" || done) return null;
    return (
      <Card padding="sm" className="border-porter-bg-border bg-porter-bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-porter-text-secondary">Enable notifications for new orders (Growth).</p>
          <Button type="button" size="sm" loading={busy} onClick={() => void subscribe()}>
            Enable
          </Button>
        </div>
        {err ? <p className="mt-2 text-xs text-porter-orange-500">{err}</p> : null}
      </Card>
    );
  }

  /* settings panel — Plan0 §9 Notifications tab */
  return (
    <Card padding="lg" className="space-y-3">
      <div>
        <h3 className="text-title text-porter-text-primary">Web Push</h3>
        <p className="mt-1 text-sm text-porter-text-secondary">
          Subscribe this browser so new orders can wake the dashboard even when the tab is in the background (Growth).
        </p>
      </div>
      {seller.plan !== "growth" ? (
        <p className="text-sm text-porter-text-muted">
          Push is available on the Growth plan.{" "}
          <Link href="/#pricing" className="font-semibold text-porter-green-400 underline-offset-2 hover:underline">
            View pricing
          </Link>
        </p>
      ) : done ? (
        <p className="text-sm font-medium text-porter-green-400">This device is subscribed.</p>
      ) : (
        <>
          <Button type="button" loading={busy} onClick={() => void subscribe()}>
            Enable push on this device
          </Button>
          {err ? <p className="text-sm text-porter-orange-500">{err}</p> : null}
        </>
      )}
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
