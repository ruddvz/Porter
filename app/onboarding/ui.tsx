"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Inserts the seller row after signup (store profile + WhatsApp fields). */
export default function OnboardingForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [zones, setZones] = useState("Manjalpur, Akota, Gotri");
  const [metaPhoneId, setMetaPhoneId] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setLoading(false);
      return;
    }
    const delivery_zones = zones
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const { error: insErr } = await supabase.from("sellers").insert({
      user_id: user.id,
      store_name: storeName,
      whatsapp_number: whatsapp,
      city: city || null,
      delivery_zones,
      meta_phone_number_id: metaPhoneId || null,
      meta_access_token: metaToken || null,
    });
    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-white/10 bg-[#111A14] p-6">
      <label className="block text-sm">
        <span className="text-white/80">Store name *</span>
        <input
          required
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none ring-[#25D366] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-white/80">WhatsApp Business number *</span>
        <input
          required
          placeholder="+9198..."
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none ring-[#25D366] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-white/80">City</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none ring-[#25D366] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-white/80">Delivery zones (comma-separated)</span>
        <input
          value={zones}
          onChange={(e) => setZones(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none ring-[#25D366] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-white/80">Meta Phone Number ID</span>
        <input
          value={metaPhoneId}
          onChange={(e) => setMetaPhoneId(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none ring-[#25D366] focus:ring-2"
        />
      </label>
      <label className="block text-sm">
        <span className="text-white/80">Meta permanent access token</span>
        <input
          type="password"
          value={metaToken}
          onChange={(e) => setMetaToken(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none ring-[#25D366] focus:ring-2"
        />
      </label>
      {error && <p className="text-sm text-[#FF6B35]">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[#25D366] py-2.5 font-semibold text-black disabled:opacity-50"
      >
        {loading ? "Saving…" : "Go to dashboard"}
      </button>
    </form>
  );
}
