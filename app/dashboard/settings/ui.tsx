"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { BotLanguagePreference, Seller } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useMemo, useState } from "react";

type Tab = "store" | "payments" | "bot" | "subscription" | "danger";

const defaultIntro = (name: string) =>
  `Hi! 👋 Welcome to ${name} on Porter. Send me your grocery list and I'll confirm prices, delivery area, and payment.`;

export default function SettingsClient({ seller }: { seller: Seller }) {
  const supabase = createSupabaseBrowserClient();
  const { push: toast } = useToast();
  const [tab, setTab] = useState<Tab>("store");
  const [busy, setBusy] = useState(false);

  const [storeName, setStoreName] = useState(seller.store_name);
  const [city, setCity] = useState(seller.city ?? "");
  const [zoneInput, setZoneInput] = useState("");
  const [zones, setZones] = useState<string[]>(seller.delivery_zones ?? []);

  const [showRzpId, setShowRzpId] = useState(false);
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [rzpId, setRzpId] = useState("");
  const [rzpSecret, setRzpSecret] = useState("");
  const [upi, setUpi] = useState(seller.upi_id ?? "");
  const [codEnabled, setCodEnabled] = useState(seller.cod_enabled);
  const [testMode, setTestMode] = useState(!!seller.razorpay_test_mode);

  const [botIntro, setBotIntro] = useState(seller.bot_intro_message?.trim() || defaultIntro(seller.store_name));
  const [botLang, setBotLang] = useState<BotLanguagePreference>((seller.bot_language as BotLanguagePreference) || "auto");

  const [deactivateOpen, setDeactivateOpen] = useState(false);

  function addZone() {
    const z = zoneInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (!z.length) return;
    setZones((prev) => Array.from(new Set([...prev, ...z])));
    setZoneInput("");
  }

  async function saveStore() {
    setBusy(true);
    const { error } = await supabase
      .from("sellers")
      .update({
        store_name: storeName,
        city: city || null,
        delivery_zones: zones,
      })
      .eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else toast("Store saved", "success");
  }

  async function savePayments() {
    setBusy(true);
    const payload: Record<string, unknown> = {
      upi_id: upi || null,
      cod_enabled: codEnabled,
      razorpay_test_mode: testMode,
    };
    if (rzpId.trim()) payload.razorpay_key_id = rzpId.trim();
    if (rzpSecret.trim()) payload.razorpay_key_secret = rzpSecret.trim();
    const { error } = await supabase.from("sellers").update(payload).eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else {
      toast("Payments saved", "success");
      setRzpSecret("");
    }
  }

  async function saveBot() {
    setBusy(true);
    const { error } = await supabase
      .from("sellers")
      .update({
        bot_intro_message: botIntro || null,
        bot_language: botLang,
      })
      .eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else toast("Bot settings saved", "success");
  }

  async function deactivate() {
    setBusy(true);
    const { error } = await supabase.from("sellers").update({ is_active: false }).eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else window.location.href = "/";
  }

  const tabs = useMemo(
    () =>
      [
        { id: "store" as const, label: "Store" },
        { id: "payments" as const, label: "Payments" },
        { id: "bot" as const, label: "Bot" },
        { id: "subscription" as const, label: "Subscription" },
        { id: "danger" as const, label: "Danger" },
      ] as const,
    [],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-3 py-4 md:px-6 md:py-6">
      <div className="flex gap-2 overflow-x-auto border-b border-porter-bg-border pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-semibold ${
              tab === t.id ? "bg-porter-green-500/15 text-porter-green-400" : "text-porter-text-secondary hover:bg-porter-bg-surface"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "store" && (
        <Card padding="lg" className="space-y-4">
          <Input.Text id="st-name" label="Store name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          <Input.Text id="st-city" label="City" value={city} onChange={(e) => setCity(e.target.value)} />
          <div>
            <Input.Text
              id="st-zones"
              label="Delivery zones"
              value={zoneInput}
              onChange={(e) => setZoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addZone();
                }
              }}
              onBlur={() => addZone()}
              placeholder="Type area and press Enter"
            />
            <div className="mt-2 flex flex-wrap gap-1">
              {zones.map((z) => (
                <button
                  key={z}
                  type="button"
                  className="rounded-full border border-porter-bg-border bg-porter-bg-raised px-2 py-1 text-xs text-porter-text-secondary hover:border-porter-orange-500/40"
                  onClick={() => setZones((prev) => prev.filter((x) => x !== z))}
                >
                  {z} ×
                </button>
              ))}
            </div>
          </div>
          <Input.Text
            id="st-wa"
            label="WhatsApp number"
            value={seller.whatsapp_number}
            disabled
            hint="Contact support to change your connected WhatsApp number."
          />
          <Button type="button" loading={busy} onClick={() => void saveStore()}>
            Save
          </Button>
        </Card>
      )}

      {tab === "payments" && (
        <Card padding="lg" className="space-y-4">
          <div className="relative">
            <Input.Text
              id="pay-rzp-id"
              label="Razorpay Key ID"
              type={showRzpId ? "text" : "password"}
              value={rzpId}
              onChange={(e) => setRzpId(e.target.value)}
              placeholder="Leave blank to keep existing"
            />
            <button
              type="button"
              className="absolute right-2 top-9 text-xs text-porter-green-400"
              onClick={() => setShowRzpId((v) => !v)}
            >
              {showRzpId ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <Input.Text
              id="pay-rzp-sec"
              label="Razorpay Key Secret"
              type={showRzpSecret ? "text" : "password"}
              value={rzpSecret}
              onChange={(e) => setRzpSecret(e.target.value)}
              placeholder="Leave blank to keep existing"
            />
            <button
              type="button"
              className="absolute right-2 top-9 text-xs text-porter-green-400"
              onClick={() => setShowRzpSecret((v) => !v)}
            >
              {showRzpSecret ? "Hide" : "Show"}
            </button>
          </div>
          <Input.Text id="pay-upi" label="UPI ID (manual fallback)" value={upi} onChange={(e) => setUpi(e.target.value)} />
          <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 py-2">
            <span className="text-sm font-semibold text-porter-text-secondary">COD enabled</span>
            <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="h-6 w-11 accent-porter-green-500" />
          </label>
          <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 py-2">
            <span className="text-sm font-semibold text-porter-text-secondary">Razorpay test mode</span>
            <input type="checkbox" checked={testMode} onChange={(e) => setTestMode(e.target.checked)} className="h-6 w-11 accent-porter-green-500" />
          </label>
          <p className="text-xs text-porter-text-muted">Test mode is stored for your account; payment link behaviour depends on your Razorpay keys.</p>
          <Button type="button" loading={busy} onClick={() => void savePayments()}>
            Save
          </Button>
        </Card>
      )}

      {tab === "bot" && (
        <Card padding="lg" className="space-y-4">
          <Input.Textarea id="bot-intro" label="Bot intro message" value={botIntro} onChange={(e) => setBotIntro(e.target.value)} rows={6} />
          <Input.Select id="bot-lang" label="Bot language preference" value={botLang} onChange={(e) => setBotLang(e.target.value as BotLanguagePreference)}>
            <option value="auto">Auto-detect</option>
            <option value="gujarati">Gujarati-first</option>
            <option value="hindi">Hindi-first</option>
            <option value="english">English-first</option>
          </Input.Select>
          <div>
            <p className="text-label text-porter-text-muted">Preview</p>
            <div className="mt-2 space-y-2 rounded-xl border border-porter-bg-border bg-porter-bg-raised p-4 text-sm text-porter-text-secondary">
              <div className="max-w-[85%] rounded-lg bg-porter-bg-surface px-3 py-2 text-porter-text-primary">{botIntro.slice(0, 280)}{botIntro.length > 280 ? "…" : ""}</div>
              <div className="ml-auto max-w-[85%] rounded-lg bg-porter-green-500/15 px-3 py-2 text-porter-text-primary">5kg bataka, 2L tael</div>
            </div>
          </div>
          <Button type="button" loading={busy} onClick={() => void saveBot()}>
            Save
          </Button>
        </Card>
      )}

      {tab === "subscription" && (
        <Card padding="lg" className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-title">Current plan</p>
            <Badge kind="plan" variant={seller.plan === "growth" ? "growth" : "starter"} label={seller.plan} />
            <span className="text-sm text-porter-text-muted">Joined {new Date(seller.created_at).toLocaleDateString()}</span>
          </div>
          <Table
            columns={[
              { key: "f", header: "Feature", cell: (r) => r.f },
              { key: "s", header: "Starter", cell: (r) => r.s },
              { key: "g", header: "Growth", cell: (r) => r.g },
            ]}
            rows={[
              { f: "WhatsApp numbers", s: "1", g: "1" },
              { f: "Orders / month", s: "500", g: "Unlimited" },
              { f: "Live dashboard", s: "Yes", g: "Yes" },
              { f: "CSV export", s: "—", g: "Yes" },
              { f: "Abandoned nudges", s: "—", g: "Yes" },
            ]}
            getRowKey={(r) => r.f}
          />
          {seller.plan === "starter" && (
            <Button type="button" variant="secondary" onClick={() => (window.location.href = "/#pricing")}>
              Upgrade to Growth
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={() => toast("Billing portal coming soon", "info")}>
            Manage billing
          </Button>
        </Card>
      )}

      {tab === "danger" && (
        <Card padding="lg" className="space-y-4 border-porter-status-cancelled/40">
          <p className="text-body text-porter-text-secondary">Deactivating stops the bot from responding for this store.</p>
          <Button type="button" variant="danger" onClick={() => setDeactivateOpen(true)}>
            Deactivate store
          </Button>
          <Card padding="md" variant="raised">
            <p className="text-title text-porter-text-primary">Delete all data</p>
            <p className="mt-2 text-body text-porter-text-secondary">Contact support to permanently delete store data.</p>
          </Card>
        </Card>
      )}

      <Modal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Deactivate store?"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={busy} onClick={() => void deactivate()}>
              Deactivate
            </Button>
          </>
        }
      >
        <p className="text-body text-porter-text-secondary">Customers will not be able to place new orders until you reactivate.</p>
      </Modal>
    </div>
  );
}
