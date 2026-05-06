"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { BotLanguagePreference, Seller, WorkingHoursMap } from "@/types";
import { checkGate, planLimits } from "@/lib/plan-gates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Table } from "@/components/ui/Table";
import { useToast } from "@/components/ui/Toast";
import { useMemo, useState } from "react";

type Tab = "store" | "delivery" | "payments" | "bot" | "hours" | "meta" | "subscription" | "growth" | "danger";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const defaultIntro = (name: string) =>
  `Hi! 👋 Welcome to ${name} on Porter. Send me your grocery list and I'll confirm prices, delivery area, and payment.`;

function emptyHours(): WorkingHoursMap {
  const m: WorkingHoursMap = {};
  for (const d of DAYS) m[d] = { open: "09:00", close: "21:00" };
  return m;
}

export default function SettingsClient({ seller, ordersThisMonth }: { seller: Seller; ordersThisMonth: number }) {
  const lim = planLimits(seller.plan ?? "starter");
  const supabase = createSupabaseBrowserClient();
  const { push: toast } = useToast();
  const [tab, setTab] = useState<Tab>("store");
  const [busy, setBusy] = useState(false);

  const [storeName, setStoreName] = useState(seller.store_name);
  const [storeDesc, setStoreDesc] = useState(seller.store_description ?? "");
  const [logoUrl, setLogoUrl] = useState(seller.logo_url ?? "");
  const [city, setCity] = useState(seller.city ?? "");

  const [zoneInput, setZoneInput] = useState("");
  const [zones, setZones] = useState<string[]>(seller.delivery_zones ?? []);
  const [timezone, setTimezone] = useState(seller.timezone ?? "Asia/Kolkata");
  const [minOrder, setMinOrder] = useState(seller.min_order_amount != null ? String(seller.min_order_amount) : "");
  const [deliveryFee, setDeliveryFee] = useState(seller.delivery_fee != null ? String(seller.delivery_fee) : "");
  const [offHoursMsg, setOffHoursMsg] = useState(seller.off_hours_message ?? "");

  const [showRzpId, setShowRzpId] = useState(false);
  const [showRzpSecret, setShowRzpSecret] = useState(false);
  const [rzpId, setRzpId] = useState("");
  const [rzpSecret, setRzpSecret] = useState("");
  const [upi, setUpi] = useState(seller.upi_id ?? "");
  const [codEnabled, setCodEnabled] = useState(seller.cod_enabled);
  const [testMode, setTestMode] = useState(!!seller.razorpay_test_mode);

  const [botIntro, setBotIntro] = useState(
    seller.plan === "growth" ? seller.bot_intro_message?.trim() || defaultIntro(seller.store_name) : defaultIntro(seller.store_name)
  );
  const [botOos, setBotOos] = useState(seller.bot_out_of_stock_message ?? "Sorry, that item is out of stock right now.");
  const [botConfirmTpl, setBotConfirmTpl] = useState(
    seller.bot_order_confirmation_template ?? "✅ Order {{id}}\n{{summary}}\n💰 ₹{{total}}\n— {{store}}"
  );
  const [botLang, setBotLang] = useState<BotLanguagePreference>((seller.bot_language as BotLanguagePreference) || "auto");

  const [hours, setHours] = useState<WorkingHoursMap>(() => {
    const h = seller.working_hours;
    if (h && typeof h === "object") return { ...emptyHours(), ...h };
    return emptyHours();
  });

  const [metaPhoneId, setMetaPhoneId] = useState(seller.meta_phone_number_id ?? "");
  const [metaToken, setMetaToken] = useState("");

  const [deactivateOpen, setDeactivateOpen] = useState(false);

  const [loyaltyOn, setLoyaltyOn] = useState(!!seller.loyalty_points_enabled);
  const [referralCode, setReferralCode] = useState((seller.referral_code ?? "").toUpperCase());
  const [broadcastText, setBroadcastText] = useState("");
  const [billingInfo, setBillingInfo] = useState<string | null>(null);

  function addZone() {
    const z = zoneInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!z.length) return;
    const next = Array.from(new Set([...zones, ...z]));
    const gate = checkGate(seller, "delivery_zones", { zoneCount: next.length });
    if (!gate.ok) {
      toast(gate.reason, "error");
      return;
    }
    setZones(next);
    setZoneInput("");
  }

  async function saveStore() {
    setBusy(true);
    const { error } = await supabase
      .from("sellers")
      .update({
        store_name: storeName,
        store_description: storeDesc || null,
        logo_url: logoUrl || null,
        city: city || null,
      })
      .eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else toast("Store saved", "success");
  }

  async function saveDelivery() {
    const gate = checkGate(seller, "delivery_zones", { zoneCount: zones.length });
    if (!gate.ok) {
      toast(gate.reason, "error");
      return;
    }
    const minN = parseFloat(minOrder);
    const feeN = parseFloat(deliveryFee);
    setBusy(true);
    const { error } = await supabase
      .from("sellers")
      .update({
        delivery_zones: zones,
        timezone: timezone.trim() || "Asia/Kolkata",
        min_order_amount: minOrder.trim() && Number.isFinite(minN) ? minN : null,
        delivery_fee: deliveryFee.trim() && Number.isFinite(feeN) ? feeN : null,
        off_hours_message: offHoursMsg.trim() || null,
      })
      .eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else toast("Delivery settings saved", "success");
  }

  async function savePayments() {
    setBusy(true);
    const payload: Record<string, unknown> = {
      cod_enabled: codEnabled,
      razorpay_test_mode: testMode,
    };
    if (rzpId.trim()) payload.razorpay_key_id = rzpId.trim();
    if (rzpSecret.trim()) payload.razorpay_key_secret = rzpSecret.trim();
    if (upi.trim()) payload.upi_id = upi.trim();
    else payload.upi_id = null;

    const { error } = await supabase.from("sellers").update(payload).eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else {
      toast("Payments saved", "success");
      setRzpSecret("");
      if (upi.trim() || rzpId.trim() || rzpSecret.trim()) {
        const enc = await fetch("/api/seller/encrypt-payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            upi: upi.trim() || null,
            razorpay_key_id: rzpId.trim() || null,
            razorpay_key_secret: rzpSecret.trim() || null,
          }),
        });
        if (enc.ok) {
          const j = (await enc.json()) as { ok?: boolean };
          if (j.ok) toast("Sensitive fields encrypted at rest.", "success");
        }
      }
    }
  }

  async function saveBot() {
    setBusy(true);
    const payload: Record<string, unknown> = {
      bot_out_of_stock_message: botOos || null,
      bot_order_confirmation_template: botConfirmTpl || null,
      bot_language: botLang,
    };
    if (seller.plan === "growth") payload.bot_intro_message = botIntro || null;
    const { error } = await supabase.from("sellers").update(payload).eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else toast("Bot settings saved", "success");
  }

  async function saveHours() {
    setBusy(true);
    const { error } = await supabase.from("sellers").update({ working_hours: hours }).eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else toast("Hours saved", "success");
  }

  async function saveMeta() {
    setBusy(true);
    const payload: Record<string, unknown> = {
      meta_phone_number_id: metaPhoneId.trim() || null,
    };
    if (metaToken.trim()) payload.meta_access_token = metaToken.trim();
    const { error } = await supabase.from("sellers").update(payload).eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else {
      toast("WhatsApp API settings saved", "success");
      if (metaToken.trim()) {
        const enc = await fetch("/api/seller/encrypt-payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meta_access_token: metaToken.trim() }),
        });
        if (enc.ok) {
          const j = (await enc.json()) as { ok?: boolean };
          if (j.ok) toast("Access token encrypted at rest.", "success");
        }
      }
      setMetaToken("");
    }
  }

  async function saveGrowth() {
    if (seller.plan !== "growth") {
      toast("Growth features require the Growth plan.", "error");
      return;
    }
    const gLoyalty = checkGate(seller, "loyalty_program");
    const gRef = checkGate(seller, "referral_code");
    if (!gLoyalty.ok || !gRef.ok) {
      toast("Growth plan required.", "error");
      return;
    }
    setBusy(true);
    const code = referralCode.trim().toUpperCase() || null;
    const { error } = await supabase
      .from("sellers")
      .update({
        loyalty_points_enabled: loyaltyOn,
        referral_code: code,
      })
      .eq("id", seller.id);
    setBusy(false);
    if (error) toast(error.message, "error");
    else toast("Growth options saved", "success");
  }

  async function sendBroadcast() {
    const g = checkGate(seller, "whatsapp_broadcast");
    if (!g.ok) {
      toast(g.reason, "error");
      return;
    }
    if (!broadcastText.trim()) {
      toast("Enter a message", "error");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/seller/broadcast", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: broadcastText.trim() }),
    });
    setBusy(false);
    const j = (await res.json().catch(() => ({}))) as { error?: string; sent?: number };
    if (!res.ok) {
      toast(j.error ?? "Broadcast failed", "error");
      return;
    }
    toast(`Sent to ${j.sent ?? 0} customers`, "success");
    setBroadcastText("");
  }

  async function loadBilling() {
    setBusy(true);
    const res = await fetch("/api/billing/status");
    setBusy(false);
    const j = (await res.json().catch(() => ({}))) as { message?: string; plan?: string };
    if (res.ok) setBillingInfo(`${j.message ?? ""} (plan: ${j.plan ?? "—"})`);
    else setBillingInfo("Could not load billing status.");
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
        { id: "delivery" as const, label: "Delivery" },
        { id: "payments" as const, label: "Payments" },
        { id: "bot" as const, label: "Bot" },
        { id: "hours" as const, label: "Hours" },
        { id: "meta" as const, label: "WhatsApp API" },
        { id: "subscription" as const, label: "Plan" },
        { id: "growth" as const, label: "Growth" },
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
          <Input.Textarea id="st-desc" label="Description" rows={3} value={storeDesc} onChange={(e) => setStoreDesc(e.target.value)} />
          <Input.Text id="st-logo" label="Logo URL" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" />
          <Input.Text id="st-city" label="City" value={city} onChange={(e) => setCity(e.target.value)} />
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

      {tab === "delivery" && (
        <Card padding="lg" className="space-y-4">
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
          <p className="text-xs text-porter-text-muted">Starter: one zone. Growth: unlimited.</p>
          <Input.Text
            id="tz"
            label="Timezone (IANA)"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Asia/Kolkata"
            hint="Used with Hours tab for open/closed checks."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input.Text
              id="min-order"
              label="Minimum order (₹)"
              inputVariant="number"
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              min={0}
              step={1}
              hint="Optional — bot blocks checkout below this total."
            />
            <Input.Text
              id="del-fee"
              label="Delivery fee (₹)"
              inputVariant="number"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              min={0}
              step={1}
              hint="Shown on printed receipt."
            />
          </div>
          <Input.Textarea
            id="off-hours"
            label="Off-hours auto-reply"
            rows={3}
            value={offHoursMsg}
            onChange={(e) => setOffHoursMsg(e.target.value)}
            placeholder="We're closed now — we'll reply when we open."
            hint="Sent when a customer messages outside working hours (see Hours tab)."
          />
          <Button type="button" loading={busy} onClick={() => void saveDelivery()}>
            Save delivery settings
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
            <button type="button" className="absolute right-2 top-9 text-xs text-porter-green-400" onClick={() => setShowRzpId((v) => !v)}>
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
            <button type="button" className="absolute right-2 top-9 text-xs text-porter-green-400" onClick={() => setShowRzpSecret((v) => !v)}>
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
          <p className="text-xs text-porter-text-muted">
            Set PORTER_CREDENTIAL_SECRET on the server, then save — UPI and Razorpay keys can be encrypted at rest (plaintext columns cleared).
          </p>
          <Button type="button" loading={busy} onClick={() => void savePayments()}>
            Save
          </Button>
        </Card>
      )}

      {tab === "bot" && (
        <Card padding="lg" className="space-y-4">
          <div>
            <p className="mb-2 text-label text-porter-text-muted">Customer preview (WhatsApp-style)</p>
            <div className="rounded-xl border border-porter-bg-border bg-[#0B141A] p-4">
              <div className="mx-auto max-w-sm">
                <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-porter-green-500/20 text-sm font-bold text-porter-green-400">
                    {(storeName || seller.store_name).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{storeName || seller.store_name}</p>
                    <p className="text-[11px] text-white/50">Business account · Preview</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[92%] whitespace-pre-wrap rounded-lg rounded-tl-sm bg-[#005C4B] px-3 py-2 text-[13px] leading-snug text-white shadow-sm">
                    {seller.plan === "growth"
                      ? botIntro.trim() || defaultIntro(storeName || seller.store_name)
                      : defaultIntro(storeName || seller.store_name)}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-porter-text-muted">
              Starter stores use the default greeting. Growth stores use your custom intro when saved.
            </p>
          </div>
          {seller.plan === "growth" ? (
            <Input.Textarea id="bot-intro" label="Custom intro (Growth)" value={botIntro} onChange={(e) => setBotIntro(e.target.value)} rows={6} />
          ) : (
            <p className="text-sm text-porter-text-secondary">Custom greeting is available on the Growth plan. Default intro is used for Starter.</p>
          )}
          <Input.Textarea id="bot-oos" label="Out of stock message" value={botOos} onChange={(e) => setBotOos(e.target.value)} rows={2} />
          <Input.Textarea
            id="bot-tpl"
            label="Order confirmation template"
            hint="Placeholders: {{summary}}, {{total}}, {{store}}, {{id}}"
            value={botConfirmTpl}
            onChange={(e) => setBotConfirmTpl(e.target.value)}
            rows={5}
          />
          <Input.Select id="bot-lang" label="Bot language preference" value={botLang} onChange={(e) => setBotLang(e.target.value as BotLanguagePreference)}>
            <option value="auto">Auto-detect</option>
            <option value="gujarati">Gujarati-first</option>
            <option value="hindi">Hindi-first</option>
            <option value="english">English-first</option>
          </Input.Select>
          <Button type="button" loading={busy} onClick={() => void saveBot()}>
            Save
          </Button>
        </Card>
      )}

      {tab === "hours" && (
        <Card padding="lg" className="space-y-4">
          <p className="text-sm text-porter-text-secondary">Shown to customers in welcome copy. Times are 24h (local).</p>
          <div className="space-y-3">
            {DAYS.map((d) => (
              <div key={d} className="grid grid-cols-3 gap-2 items-end">
                <span className="text-label capitalize text-porter-text-muted">{d}</span>
                <Input.Text
                  id={`h-${d}-o`}
                  label="Open"
                  value={hours[d]?.open ?? "09:00"}
                  onChange={(e) => setHours((h) => ({ ...h, [d]: { open: e.target.value, close: h[d]?.close ?? "21:00" } }))}
                />
                <Input.Text
                  id={`h-${d}-c`}
                  label="Close"
                  value={hours[d]?.close ?? "21:00"}
                  onChange={(e) => setHours((h) => ({ ...h, [d]: { open: h[d]?.open ?? "09:00", close: e.target.value } }))}
                />
              </div>
            ))}
          </div>
          <Button type="button" loading={busy} onClick={() => void saveHours()}>
            Save hours
          </Button>
        </Card>
      )}

      {tab === "meta" && (
        <Card padding="lg" className="space-y-4">
          <Input.Text id="meta-phone" label="Meta Phone Number ID" value={metaPhoneId} onChange={(e) => setMetaPhoneId(e.target.value)} />
          <Input.Text
            id="meta-token"
            label="Meta access token"
            type="password"
            value={metaToken}
            onChange={(e) => setMetaToken(e.target.value)}
            placeholder="Leave blank to keep existing"
          />
          <Button type="button" loading={busy} onClick={() => void saveMeta()}>
            Save
          </Button>
        </Card>
      )}

      {tab === "growth" && (
        <Card padding="lg" className="space-y-4">
          {seller.plan !== "growth" ? (
            <p className="text-body text-porter-text-secondary">Switch to Growth to use loyalty, referral codes, and customer broadcasts.</p>
          ) : (
            <>
              <label className="flex cursor-pointer items-center gap-2 text-body">
                <input type="checkbox" checked={loyaltyOn} onChange={(e) => setLoyaltyOn(e.target.checked)} />
                Enable loyalty points (₹1 of delivered order = 1 point)
              </label>
              <Input.Text
                id="ref-code"
                label="Referral code (customers mention it in their order message)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="e.g. FRESH20"
              />
              <Button type="button" loading={busy} onClick={() => void saveGrowth()}>
                Save growth options
              </Button>
              <div className="border-t border-porter-bg-border pt-4">
                <Input.Textarea
                  id="broadcast"
                  label="Broadcast to all past customers (WhatsApp)"
                  rows={3}
                  value={broadcastText}
                  onChange={(e) => setBroadcastText(e.target.value)}
                  placeholder="Store update, offer, or timing change…"
                />
                <Button type="button" variant="secondary" className="mt-2" loading={busy} onClick={() => void sendBroadcast()}>
                  Send broadcast
                </Button>
              </div>
              <div className="border-t border-porter-bg-border pt-4">
                <p className="text-label text-porter-text-muted">Billing</p>
                <p className="mt-1 text-sm text-porter-text-secondary">
                  Porter subscription billing is manual today — check status for your account.
                </p>
                <Button type="button" variant="ghost" size="sm" className="mt-2" onClick={() => void loadBilling()}>
                  Refresh billing status
                </Button>
                {billingInfo ? <p className="mt-2 text-sm text-porter-text-secondary">{billingInfo}</p> : null}
              </div>
            </>
          )}
        </Card>
      )}

      {tab === "subscription" && (
        <Card padding="lg" className="space-y-4">
          <div className="rounded-lg border border-porter-bg-border bg-porter-bg-surface p-4">
            <p className="text-label text-porter-text-muted">Orders this month</p>
            <p className="mt-1 font-display text-3xl text-porter-text-primary">
              {ordersThisMonth}
              <span className="text-lg font-sans text-porter-text-secondary">
                {" "}
                / {seller.plan === "growth" ? "∞" : String(lim.maxOrdersPerMonth)}
              </span>
            </p>
            {seller.plan === "starter" && ordersThisMonth >= lim.maxOrdersPerMonth * 0.85 && (
              <p className="mt-2 text-xs text-porter-orange-500">
                Approaching your monthly cap — upgrade to Growth for unlimited orders.
              </p>
            )}
          </div>
          <Table
            columns={[
              { key: "f", header: "Feature", cell: (r) => r.f },
              { key: "s", header: "Starter", cell: (r) => r.s },
              { key: "g", header: "Growth", cell: (r) => r.g },
            ]}
            rows={[
              { f: "Products", s: "50", g: "Unlimited" },
              { f: "Orders / month", s: "200", g: "Unlimited" },
              { f: "Analytics history", s: "30 days", g: "12 months" },
              { f: "Push + nudge cron", s: "—", g: "Yes" },
              { f: "Custom bot greeting", s: "—", g: "Yes" },
              { f: "Delivery zones", s: "1", g: "Unlimited" },
            ]}
            getRowKey={(r) => r.f}
          />
          {seller.plan === "starter" && (
            <Button type="button" variant="secondary" onClick={() => (window.location.href = "/#pricing")}>
              Upgrade to Growth
            </Button>
          )}
        </Card>
      )}

      {tab === "danger" && (
        <Card padding="lg" className="space-y-4 border-porter-status-cancelled/40">
          <p className="text-body text-porter-text-secondary">Deactivating stops the bot from responding for this store.</p>
          <Button type="button" variant="danger" onClick={() => setDeactivateOpen(true)}>
            Deactivate store
          </Button>
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
