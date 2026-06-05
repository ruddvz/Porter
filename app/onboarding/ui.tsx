"use client";

import confetti from "canvas-confetti";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StickyBottomAction } from "@/components/ui/StickyBottomAction";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { slugifyStoreName } from "@/lib/store-slug";
import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "mt-1.5 w-full min-h-11 rounded-[var(--po-radius-sm)] border border-porter-bg-border bg-porter-bg-surface px-3 py-2.5 text-base text-porter-text-primary outline-none focus:border-porter-green-500 focus:ring-2 focus:ring-porter-green-500/20";

/** Guided seller setup — store first, optional WhatsApp API, delivery zones. */
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metaOk, setMetaOk] = useState<string | null>(null);
  const [testingMeta, setTestingMeta] = useState(false);

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
        data?: { display_phone_number?: string | null; verified_name?: string | null };
        error?: { message?: string } | null;
      };
      if (!res.ok || j.error) {
        setError(j.error?.message || "Connection failed");
        return;
      }
      const line = [j.data?.verified_name, j.data?.display_phone_number].filter(Boolean).join(" · ");
      setMetaOk(line || "Connected — your WhatsApp API looks good.");
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
        store_slug: slugifyStoreName(storeName),
        whatsapp_number: whatsapp,
        whatsapp_provider: metaPhoneId ? "meta" : "openwa",
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
    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.65 }, colors: ["#0f7a3a", "#ffffff", "#f26b00"] });
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, 450));
    if (inserted?.id) {
      void fetch("/api/internal/after-seller-created", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seller_id: inserted.id }),
      });
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

  const stepLabels = ["Your store", "WhatsApp", "Delivery"];

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-28">
      <ol className="flex gap-2 text-sm" aria-label="Setup progress">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as 1 | 2 | 3;
          const active = step === n;
          const done = step > n;
          return (
            <li
              key={label}
              className={`flex-1 rounded-pill border px-2 py-2 text-center text-xs font-semibold ${
                active
                  ? "border-porter-green-500 bg-[var(--po-primary-soft)] text-porter-green-600"
                  : done
                    ? "border-porter-bg-border bg-porter-bg-surface text-porter-text-secondary"
                    : "border-porter-bg-border text-porter-text-muted"
              }`}
            >
              {label}
            </li>
          );
        })}
      </ol>

      {step === 1 && (
        <Card padding="lg" className="space-y-4">
          <div>
            <h2 className="text-heading text-porter-text-primary">Tell us about your shop</h2>
            <p className="mt-1 text-body">We use this on receipts, WhatsApp replies, and your store link.</p>
          </div>
          <form onSubmit={nextFromStep1} className="space-y-4">
            <label className="block text-sm font-medium text-porter-text-primary">
              Store name
              <input required value={storeName} onChange={(e) => setStoreName(e.target.value)} className={fieldClass} />
            </label>
            <label className="block text-sm font-medium text-porter-text-primary">
              WhatsApp number for orders
              <input required placeholder="+9198…" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={fieldClass} inputMode="tel" />
            </label>
            <label className="block text-sm font-medium text-porter-text-primary">
              City (optional)
              <input value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass} />
            </label>
            {error ? <p className="text-sm text-porter-orange-500" role="alert">{error}</p> : null}
            <StickyBottomAction className="-mx-4 rounded-none border-x-0">
              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
            </StickyBottomAction>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card padding="lg" className="space-y-4">
          <div>
            <h2 className="text-heading text-porter-text-primary">Connect WhatsApp (optional)</h2>
            <p className="mt-1 text-body">
              You can skip this and connect later in Settings. Porter can still run with OpenWA or manual setup.
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-porter-green-600 underline-offset-2 hover:underline"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide advanced Meta API fields" : "I have Meta Cloud API credentials"}
          </button>
          {showAdvanced ? (
            <div className="space-y-3 rounded-[var(--po-radius-sm)] border border-porter-bg-border bg-porter-bg-raised p-4">
              <label className="block text-sm font-medium">
                Phone number ID
                <input value={metaPhoneId} onChange={(e) => setMetaPhoneId(e.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium">
                Access token
                <input type="password" value={metaToken} onChange={(e) => setMetaToken(e.target.value)} className={fieldClass} />
              </label>
              <Button type="button" variant="secondary" loading={testingMeta} onClick={() => void testMeta()} disabled={!metaPhoneId.trim() || !metaToken.trim()}>
                Test connection
              </Button>
              {metaOk ? <p className="text-sm text-porter-green-600">{metaOk}</p> : null}
            </div>
          ) : null}
          {error ? <p className="text-sm text-porter-orange-500">{error}</p> : null}
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={() => setStep(3)}>
              {showAdvanced && metaPhoneId ? "Continue" : "Skip for now"}
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card padding="lg" className="space-y-4">
          <div>
            <h2 className="text-heading text-porter-text-primary">Where do you deliver?</h2>
            <p className="mt-1 text-body">Comma-separated area names help the bot confirm addresses.</p>
          </div>
          <form onSubmit={finish} className="space-y-4">
            <label className="block text-sm font-medium text-porter-text-primary">
              Delivery areas
              <textarea value={zones} onChange={(e) => setZones(e.target.value)} rows={3} className={`${fieldClass} resize-y`} />
            </label>
            {error ? <p className="text-sm text-porter-orange-500">{error}</p> : null}
            <StickyBottomAction className="-mx-4 rounded-none border-x-0">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" size="lg" loading={loading}>
                  Open my dashboard
                </Button>
              </div>
            </StickyBottomAction>
          </form>
        </Card>
      )}
    </div>
  );
}
