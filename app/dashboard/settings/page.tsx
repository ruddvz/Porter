"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table, type TableColumn } from "@/components/ui/Table";
import { cn } from "@/lib/utils";
import { useState } from "react";

const tabs = ["Store", "Payments", "Bot", "Subscription", "Danger"] as const;

export default function SettingsPage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Store");
  const [zones, setZones] = useState<string[]>(["Manjalpur", "Tarsali", "Maneja"]);
  const [zoneInput, setZoneInput] = useState("");
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const addZone = () => {
    const value = zoneInput.trim();
    if (!value || zones.includes(value)) return;
    setZones((list) => [...list, value]);
    setZoneInput("");
  };

  const starterCols: TableColumn<{ feature: string; starter: string; growth: string }>[] = [
    { id: "f", header: "", cell: (r) => r.feature },
    { id: "s", header: "Starter", cell: (r) => r.starter },
    { id: "g", header: "Growth", cell: (r) => r.growth },
  ];
  const rows = [
    { feature: "Orders / month", starter: "500", growth: "Unlimited" },
    { feature: "CSV export", starter: "—", growth: "Yes" },
    { feature: "Abandoned nudges", starter: "—", growth: "Yes" },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-space-6">
      <div className="flex gap-space-1 overflow-x-auto border-b border-porter-bg-border pb-0">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "min-h-11 shrink-0 border-b-2 px-space-4 text-sm font-semibold transition-colors",
              tab === t
                ? "border-porter-green-500 text-porter-text-primary"
                : "border-transparent text-porter-text-muted hover:text-porter-text-secondary"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Store" && (
        <Card padding="lg" className="space-y-space-4">
          <Input label="Store name" variant="text" defaultValue="Demo Store" />
          <Input label="City" variant="text" defaultValue="Vadodara" />
          <div>
            <p className="text-label text-porter-text-muted">Delivery zones</p>
            <div className="mt-space-2 flex flex-wrap gap-space-2">
              {zones.map((z) => (
                <span
                  key={z}
                  className="inline-flex items-center gap-1 rounded-full border border-porter-bg-border bg-porter-bg-raised px-space-3 py-1 text-sm text-porter-text-primary"
                >
                  {z}
                  <button
                    type="button"
                    className="text-porter-text-muted hover:text-porter-orange-500"
                    onClick={() => setZones((list) => list.filter((x) => x !== z))}
                    aria-label={`Remove ${z}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-space-2 flex gap-space-2">
              <Input
                label="Add zone"
                variant="text"
                value={zoneInput}
                onChange={(e) => setZoneInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addZone())}
              />
              <Button type="button" variant="secondary" className="mt-6 shrink-0" onClick={addZone}>
                Add
              </Button>
            </div>
          </div>
          <Input
            label="WhatsApp number"
            variant="text"
            defaultValue="+91 98765 43210"
            disabled
            hint="Contact support to change after onboarding."
          />
          <Button type="button" variant="primary">
            Save
          </Button>
        </Card>
      )}

      {tab === "Payments" && (
        <Card padding="lg" className="space-y-space-4">
          <Input label="Razorpay Key ID" variant="text" type="password" defaultValue="rzp_live_xxxx" />
          <Input label="Razorpay Key Secret" variant="text" type="password" defaultValue="••••••••" />
          <Input label="UPI ID (fallback)" variant="text" placeholder="shop@upi" />
          <label className="flex min-h-11 items-center gap-space-3 text-body text-porter-text-primary">
            <input type="checkbox" defaultChecked className="h-5 w-5 accent-porter-green-500" />
            COD enabled
          </label>
          <label className="flex min-h-11 items-center gap-space-3 text-body text-porter-text-primary">
            <input type="checkbox" className="h-5 w-5 accent-porter-green-500" />
            Test mode (Razorpay test links)
          </label>
          <Button type="button" variant="primary">
            Save
          </Button>
        </Card>
      )}

      {tab === "Bot" && (
        <Card padding="lg" className="space-y-space-4">
          <Input
            label="Bot intro message"
            variant="textarea"
            rows={5}
            defaultValue="Hi! Welcome to Demo Store on Porter. Send me your grocery list..."
          />
          <Input
            label="Bot language"
            variant="select"
            defaultValue="auto"
            options={[
              { value: "auto", label: "Auto-detect" },
              { value: "gu", label: "Gujarati-first" },
              { value: "hi", label: "Hindi-first" },
              { value: "en", label: "English-first" },
            ]}
          />
          <Card variant="default" padding="md">
            <p className="text-label text-porter-text-muted">Preview (read-only)</p>
            <p className="mt-space-2 text-body text-porter-text-secondary">
              Mock WhatsApp thread — connect Meta in production to see live flow.
            </p>
          </Card>
          <Button type="button" variant="primary">
            Save
          </Button>
        </Card>
      )}

      {tab === "Subscription" && (
        <div className="space-y-space-4">
          <Card padding="lg" className="flex flex-wrap items-center justify-between gap-space-4">
            <div>
              <p className="text-label text-porter-text-muted">Current plan</p>
              <div className="mt-space-2 flex items-center gap-space-2">
                <Badge variant="plan" plan="starter" label="Starter" />
                <span className="text-mono text-porter-text-muted">Renews —</span>
              </div>
            </div>
            <Button type="button" variant="secondary">
              Manage billing
            </Button>
          </Card>
          <Card padding="none">
            <Table columns={starterCols} data={rows} getRowKey={(r) => r.feature} />
          </Card>
          <Button type="button" variant="primary">
            Upgrade to Growth
          </Button>
        </div>
      )}

      {tab === "Danger" && (
        <Card padding="lg" className="border-porter-status-cancelled/40 space-y-space-4">
          <p className="text-title text-porter-status-cancelled">Danger zone</p>
          <p className="text-body text-porter-text-secondary">
            Deactivate stops the bot from responding. Delete all data is not self-serve — contact support.
          </p>
          <Button type="button" variant="danger" onClick={() => setDeactivateOpen(true)}>
            Deactivate store
          </Button>
          <Card variant="default" padding="md">
            <p className="text-sm font-semibold text-porter-text-primary">Delete all data</p>
            <p className="mt-space-1 text-body text-porter-text-muted">Contact support to request full deletion.</p>
          </Card>
        </Card>
      )}

      <Modal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Deactivate store?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={() => setDeactivateOpen(false)}>
              Deactivate
            </Button>
          </>
        }
      >
        <p className="text-body text-porter-text-secondary">
          The WhatsApp bot will stop replying until you reactivate.
        </p>
      </Modal>
    </div>
  );
}
