"use client";

import { Button } from "@/components/ui/Button";
import confetti from "canvas-confetti";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Multi-step onboarding: store profile → Meta API test → delivery zones. */
export default function OnboardingForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [storeName, setStoreName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [zones, setZones] = useState("Manjalpur, Akota, Gotri");
  const [metaPhoneId, setMetaPhoneId] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metaOk, setMetaOk] = useState<string | null>(null);
  const [testingMeta, setTestingMeta] = useState(false);

  const shell = "rounded-xl border border-white/10 bg-[#111A14] p-6";

  async function testMeta() {
    setTestingMeta(true);
    setError(null);
    setMetaOk(null);
    try {
      const res = await fetch("/api/seller/test-meta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number_id: metaPhoneId, access_token: metaToken }),
      });
      const j = (await res.json()) as {
        ok?: boolean;
        error?: string;
        display_phone_number?: string | null;
        verified_name?: string | null;
      };
      if (!j.ok) {
        setError(j.error || "Connection failed");
        return;
      }
      const line = [j.verified_name, j.display_phone_number].filter(Boolean).join(" · ");
      setMetaOk(line || "Connected — token is valid.");
    } catch {
      setError("Could not reach test endpoint");
    } finally {
      setTestingMeta(false);
    }
  }

  async function finish(e: React.FormEvent) {
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
    const { data: inserted, error: insErr } = await supabase
      .from("sellers")
      .insert({
        user_id: user.id,
        store_name: storeName,
        whatsapp_number: whatsapp,
        city: city || null,
        delivery_zones,
        meta_phone_number_id: metaPhoneId || null,
        meta_access_token: metaToken || null,
      })
      .select("id")
      .single();
    setLoading(false);
    if (insErr) {
      setError(insErr.message);
      return;
    }
    if (inserted?.id) {
      confetti({
        particleCount: 140,
        spread: 75,
        origin: { y: 0.65 },
        colors: ["#25D366", "#ffffff", "#128C7E"],
      });
      void fetch("/api/internal/after-seller-created", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: inserted.id }),
      });
      await new Promise((r) => setTimeout(r, 450));
    }
    router.push("/dashboard");
    router.refresh();
  }

  function nextFromStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!storeName.trim() || !whatsapp.trim()) {
      setError("Store name and WhatsApp number are required.");
      return;
    }
    setError(null);
    setStep(2);
  }

  const inp =
    "mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none ring-[#25D366] focus:ring-2";

  return (
    <div className="mt-8 space-y-6">
      <div className="flex gap-2 text-sm text-[--text-muted]">
        <span className={step === 1 ? "font-mono font-semibold text-[--accent]" : ""}>1 Store</span>
        <span aria-hidden>→</span>
        <span className={step === 2 ? "font-mono font-semibold text-[--accent]" : ""}>2 WhatsApp API</span>
        <span aria-hidden>→</span>
        <span className={step === 3 ? "font-mono font-semibold text-[--accent]" : ""}>3 Launch</span>
      </div>

      {step === 1 && (
        <form onSubmit={nextFromStep1} className={`space-y-4 ${shell}`}>
          <label className="block text-sm">
            <span className="text-white/80">Store name *</span>
            <input required value={storeName} onChange={(e) => setStoreName(e.target.value)} className={inp} />
          </label>
          <label className="block text-sm">
            <span className="text-white/80">WhatsApp Business number *</span>
            <input required placeholder="+9198..." value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inp} />
          </label>
          <label className="block text-sm">
            <span className="text-white/80">City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} className={inp} />
          </label>
          {error && <p className="text-sm text-[#FF6B35]">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-[#25D366] px-4 py-3 font-semibold text-black transition hover:bg-[#20bd5a]"
          >
            Continue
          </button>
        </form>
      )}

      {step === 2 && (
        <div className={`space-y-4 ${shell}`}>
          <p className="text-sm text-white/70">
            Paste your Meta Phone Number ID and permanent access token. Test the connection before continuing, or skip and add these in Settings later.
          </p>
          <label className="block text-sm">
            <span className="text-white/80">Meta Phone Number ID</span>
            <input value={metaPhoneId} onChange={(e) => setMetaPhoneId(e.target.value)} className={inp} />
          </label>
          <label className="block text-sm">
            <span className="text-white/80">Meta permanent access token</span>
            <input type="password" value={metaToken} onChange={(e) => setMetaToken(e.target.value)} className={inp} />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" loading={testingMeta} onClick={() => void testMeta()} disabled={!metaPhoneId.trim() || !metaToken.trim()}>
              Test connection
            </Button>
            <button type="button" className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white/80 hover:bg-white/5" onClick={() => setStep(3)}>
              Skip for now
            </button>
          </div>
          {metaOk && <p className="text-sm text-[#25D366]">{metaOk}</p>}
          {error && <p className="text-sm text-[#FF6B35]">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5" onClick={() => setStep(1)}>
              Back
            </button>
            <button
              type="button"
              className="rounded-lg bg-[#25D366] px-4 py-2 font-semibold text-black hover:bg-[#20bd5a]"
              onClick={() => setStep(3)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={finish} className={`space-y-4 ${shell}`}>
          <label className="block text-sm">
            <span className="text-white/80">Delivery zones (comma-separated)</span>
            <textarea value={zones} onChange={(e) => setZones(e.target.value)} rows={3} className={`${inp} resize-y`} />
          </label>
          <p className="text-xs text-white/50">You can edit zones anytime under Settings → Delivery.</p>
          {error && <p className="text-sm text-[#FF6B35]">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5" onClick={() => setStep(2)}>
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[#25D366] px-4 py-3 font-semibold text-black hover:bg-[#20bd5a] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Go to dashboard"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
