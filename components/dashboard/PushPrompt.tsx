"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Seller } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

type PushVariant = "banner" | "settings";

function isStandalonePwa(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function PushPrompt({ seller, variant = "banner" }: { seller: Seller; variant?: PushVariant }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    setInstalled(isStandalonePwa());
    try {
      if (localStorage.getItem("porter-push-dismissed") === "1") setDismissed(true);
    } catch {
      /* ignore */
    }
  }, []);

  async function subscribe() {
    setErr(null);
    if (seller.plan !== "growth") {
      setErr("Push notifications are included in the Growth plan.");
      return;
    }
    if (isIos() && !installed) {
      setErr("Install Porter to your Home Screen first, then enable notifications from Settings.");
      return;
    }
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setErr("This browser does not support web push.");
      return;
    }
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapid) {
      setErr(process.env.NODE_ENV === "production" ? "Push is not configured for this deployment." : "VAPID keys are not configured (admin).");
      return;
    }
    if (Notification.permission === "denied") {
      setErr("Notifications are blocked. On iPhone: Settings → Porter → Notifications → Allow.");
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

  async function sendTest() {
    setErr(null);
    setBusy(true);
    const res = await fetch("/api/push/test", { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      setErr(j.error?.message ?? "Test notification failed");
      return;
    }
    setDone(true);
  }

  if (variant === "banner") {
    if (seller.plan !== "growth" || done || dismissed) return null;
    return (
      <Card padding="sm" className="border-porter-bg-border bg-porter-bg-surface">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-porter-text-secondary">
            {installed
              ? "Enable iPhone push alerts for new orders (Growth plan)."
              : "Install Porter to your Home Screen, then enable push for new orders (Growth)."}
          </p>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={() => {
              setDismissed(true);
              try {
                localStorage.setItem("porter-push-dismissed", "1");
              } catch {
                /* ignore */
              }
            }}>
              Not now
            </Button>
            <Button type="button" size="sm" loading={busy} onClick={() => void subscribe()}>
              Enable
            </Button>
          </div>
        </div>
        {err ? <p className="mt-2 text-xs text-porter-orange-500">{err}</p> : null}
      </Card>
    );
  }

  return (
    <Card padding="lg" className="space-y-3">
      <div>
        <h3 className="text-title text-porter-text-primary">Web Push</h3>
        <p className="mt-1 text-sm text-porter-text-secondary">
          Get new-order alerts on this device. On iPhone, add Porter to your Home Screen before subscribing (Growth plan).
        </p>
      </div>
      {seller.plan !== "growth" ? (
        <p className="text-sm text-porter-text-muted">
          Push is included in Growth.{" "}
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
          <Button type="button" variant="secondary" loading={busy} onClick={() => void sendTest()}>
            Send test notification
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
