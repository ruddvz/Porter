"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Seller } from "@/types";
import { useState } from "react";

/** Store settings: profile, payments, bot preview, plan, deactivate. */
export default function SettingsClient({ seller }: { seller: Seller }) {
  const supabase = createSupabaseBrowserClient();
  const [storeName, setStoreName] = useState(seller.store_name);
  const [city, setCity] = useState(seller.city ?? "");
  const [whatsapp, setWhatsapp] = useState(seller.whatsapp_number);
  const [zones, setZones] = useState((seller.delivery_zones ?? []).join(", "));
  const [upi, setUpi] = useState(seller.upi_id ?? "");
  const [rzpId, setRzpId] = useState("");
  const [rzpSecret, setRzpSecret] = useState("");
  const [metaPhoneId, setMetaPhoneId] = useState(seller.meta_phone_number_id ?? "");
  const [metaToken, setMetaToken] = useState("");
  const [codEnabled, setCodEnabled] = useState(seller.cod_enabled);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function saveProfile() {
    setBusy(true);
    setMsg(null);
    const delivery_zones = zones
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const { error } = await supabase
      .from("sellers")
      .update({
        store_name: storeName,
        city: city || null,
        whatsapp_number: whatsapp,
        delivery_zones,
        upi_id: upi || null,
        meta_phone_number_id: metaPhoneId || null,
        cod_enabled: codEnabled,
        ...(metaToken ? { meta_access_token: metaToken } : {}),
        ...(rzpId ? { razorpay_key_id: rzpId } : {}),
        ...(rzpSecret ? { razorpay_key_secret: rzpSecret } : {}),
      })
      .eq("id", seller.id);
    setBusy(false);
    setMsg(error ? error.message : "Saved");
    if (!error) {
      setRzpSecret("");
      setMetaToken("");
    }
  }

  async function deactivate() {
    if (!confirm("Deactivate store? Customers will not be able to place new orders.")) return;
    setBusy(true);
    const { error } = await supabase.from("sellers").update({ is_active: false }).eq("id", seller.id);
    setBusy(false);
    if (error) alert(error.message);
    else window.location.href = "/";
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-display text-3xl text-white">Settings</h1>

      <section className="mt-8 space-y-4 rounded-xl border border-white/10 bg-[#111A14] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Store profile</h2>
        <label className="block text-sm">
          <span className="text-white/70">Store name</span>
          <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm">
          <span className="text-white/70">City</span>
          <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm">
          <span className="text-white/70">WhatsApp number</span>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm">
          <span className="text-white/70">Delivery zones (comma-separated)</span>
          <input value={zones} onChange={(e) => setZones(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="flex items-center gap-2 text-sm text-white/80">
          <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="accent-[#25D366]" />
          COD enabled for customers
        </label>
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-white/10 bg-[#111A14] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Payment setup</h2>
        <p className="text-xs text-white/50">Encrypt secrets in production before storing. Keys are saved only when you type new values.</p>
        <label className="block text-sm">
          <span className="text-white/70">Razorpay Key ID</span>
          <input value={rzpId} onChange={(e) => setRzpId(e.target.value)} placeholder="••••••" className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm">
          <span className="text-white/70">Razorpay Key Secret</span>
          <input type="password" value={rzpSecret} onChange={(e) => setRzpSecret(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm">
          <span className="text-white/70">UPI ID (manual fallback)</span>
          <input value={upi} onChange={(e) => setUpi(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
      </section>

      <section className="mt-6 space-y-4 rounded-xl border border-white/10 bg-[#111A14] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">WhatsApp (Meta)</h2>
        <label className="block text-sm">
          <span className="text-white/70">Phone Number ID</span>
          <input value={metaPhoneId} onChange={(e) => setMetaPhoneId(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
        <label className="block text-sm">
          <span className="text-white/70">Permanent access token</span>
          <input type="password" value={metaToken} onChange={(e) => setMetaToken(e.target.value)} placeholder="Leave blank to keep existing" className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
        </label>
      </section>

      <section className="mt-6 rounded-xl border border-white/10 bg-[#111A14] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Bot preview</h2>
        <p className="mt-3 rounded-lg bg-black/40 p-4 text-sm text-white/80">
          Namaste! {storeName} par order karva mate list moklo. Hu tamne area ane address puchis, pachhi payment link moklish.
        </p>
      </section>

      <section className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#111A14] p-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white/50">Subscription</h2>
          <p className="mt-2 text-white">Current plan: <span className="text-[#25D366]">{seller.plan}</span></p>
        </div>
        <a href="/#pricing" className="rounded-lg bg-[#FF6B35] px-3 py-2 text-sm font-semibold text-black">
          Upgrade
        </a>
      </section>

      <button type="button" disabled={busy} onClick={saveProfile} className="mt-6 w-full rounded-lg bg-[#25D366] py-3 font-semibold text-black">
        Save changes
      </button>
      {msg && <p className="mt-2 text-center text-sm text-white/70">{msg}</p>}

      <section className="mt-10 rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <h2 className="text-sm font-semibold text-red-300">Danger zone</h2>
        <button type="button" onClick={deactivate} className="mt-3 rounded-lg border border-red-400 px-4 py-2 text-sm text-red-200">
          Deactivate store
        </button>
      </section>
    </div>
  );
}
