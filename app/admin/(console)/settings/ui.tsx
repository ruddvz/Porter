"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import type { PlatformSettings } from "@/types";
import { useEffect, useState } from "react";

export default function AdminSettingsClient() {
  const { push: toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState<PlatformSettings | null>(null);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    void fetch("/api/admin/platform-settings")
      .then((r) => r.json())
      .then((d) => {
        setRow(d as PlatformSettings);
        setAnnouncement((d as PlatformSettings).announcement ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function save() {
    if (!row) return;
    setSaving(true);
    const res = await fetch("/api/admin/platform-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        starter_product_limit: row.starter_product_limit,
        starter_orders_per_month: row.starter_orders_per_month,
        starter_analytics_days: row.starter_analytics_days,
        growth_analytics_days: row.growth_analytics_days,
        announcement: announcement || null,
      }),
    });
    setSaving(false);
    if (!res.ok) toast((await res.json()).error ?? "Save failed", "error");
    else toast("Platform settings saved", "success");
  }

  if (loading || !row) {
    return <p className="text-porter-text-secondary">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-heading">Admin settings</h1>
      <Card padding="lg" className="space-y-4">
        <Input.Text
          id="ps-sp"
          label="Starter product limit"
          inputVariant="number"
          value={String(row.starter_product_limit)}
          onChange={(e) => setRow({ ...row, starter_product_limit: parseInt(e.target.value, 10) || 0 })}
        />
        <Input.Text
          id="ps-so"
          label="Starter orders per month"
          inputVariant="number"
          value={String(row.starter_orders_per_month)}
          onChange={(e) => setRow({ ...row, starter_orders_per_month: parseInt(e.target.value, 10) || 0 })}
        />
        <Input.Text
          id="ps-sa"
          label="Starter analytics (days)"
          inputVariant="number"
          value={String(row.starter_analytics_days)}
          onChange={(e) => setRow({ ...row, starter_analytics_days: parseInt(e.target.value, 10) || 0 })}
        />
        <Input.Text
          id="ps-ga"
          label="Growth analytics (days)"
          inputVariant="number"
          value={String(row.growth_analytics_days)}
          onChange={(e) => setRow({ ...row, growth_analytics_days: parseInt(e.target.value, 10) || 0 })}
        />
        <Input.Textarea id="ps-ann" label="Announcement banner" rows={3} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} />
        <Button type="button" loading={saving} onClick={() => void save()}>
          Save
        </Button>
      </Card>
      <p className="text-xs text-porter-text-muted">Plan limits are enforced in the app; adjust numbers to match your commercial terms.</p>
    </div>
  );
}
