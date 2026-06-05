"use client";

import confetti from "canvas-confetti";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { HeroCard } from "@/components/ui/HeroCard";
import { StickyBottomAction } from "@/components/ui/StickyBottomAction";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { slugifyStoreName } from "@/lib/store-slug";
import { useRouter } from "next/navigation";
import { useState } from "react";

const fieldClass =
  "mt-1.5 w-full min-h-12 rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-surface px-3 py-2.5 text-base text-porter-text-primary outline-none focus:border-porter-green-500 focus:ring-2 focus:ring-porter-green-500/20";

const STORE_CATEGORIES = [
  "Grocery",
  "Fruits & vegetables",
  "Pharmacy",
  "Tiffin",
  "Bakery",
  "General store",
  "Other",
] as const;

type Step = 1 | 2 | 3 | 4 | 5;

/** Guided seller setup — store first, delivery, optional products/WhatsApp. */
export default function OnboardingForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [storeName, setStoreName] = useState("");
  const [storeCategory, setStoreCategory] = useState<string>(STORE_CATEGORIES[0]);
  const [ownerName, setOwnerName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [locality, setLocality] = useState("");
  const [deliveryMode, setDeliveryMode] = useState<"pickup" | "delivery" | "both">("both");
  const [minOrder, setMinOrder] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [zones, setZones] = useState("Manjalpur, Akota, Gotri");
  const [codEnabled, setCodEnabled] = useState(true);
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [productsChoice, setProductsChoice] = useState<"skip" | "manual" | "csv" | "sample">("skip");
  const [metaPhoneId, setMetaPhoneId] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [metaOk, setMetaOk] = useState<string | null>(null);
  const [testingMeta, setTestingMeta] = useState(false);

  const stepLabels = ["Store", "Delivery", "Products", "WhatsApp", "Launch"];

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

  async function finish() {
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
    if (locality.trim() && !delivery_zones.includes(locality.trim())) {
      delivery_zones.unshift(locality.trim());
    }
    const pickup_enabled = deliveryMode === "pickup" || deliveryMode === "both";
    const delivery_enabled = deliveryMode === "delivery" || deliveryMode === "both";

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
        store_description: [storeCategory, ownerName ? `Owner: ${ownerName}` : null].filter(Boolean).join(" · ") || null,
        min_order_amount: minOrder ? Number(minOrder) : null,
        delivery_fee: deliveryFee ? Number(deliveryFee) : null,
        cod_enabled: codEnabled,
        pickup_enabled,
        delivery_enabled,
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
        body: JSON.stringify({ seller_id: inserted.id, products_choice: productsChoice }),
      });
    }
    router.push("/dashboard");
    router.refresh();
  }

  function nextFromStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!storeName.trim() || !whatsapp.trim()) {
      setError("Store name and phone are required.");
      return;
    }
    setError(null);
    setStep(2);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 pb-28">
      <HeroCard
        eyebrow="Setup"
        title="Start your store workspace"
        description="Set up orders, inventory, and customer updates in minutes."
        variant="green"
      />

      <ol className="flex gap-2 text-sm" aria-label="Setup progress">
        {stepLabels.map((label, i) => {
          const n = (i + 1) as Step;
          const active = step === n;
          const done = step > n;
          return (
            <li
              key={label}
              className={`flex-1 rounded-[var(--po-radius-pill)] border px-1.5 py-2 text-center text-[11px] font-semibold ${
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
            <h2 className="text-heading text-porter-text-primary">Store basics</h2>
            <p className="mt-1 text-body">We use this on receipts, WhatsApp replies, and your store link.</p>
          </div>
          <form onSubmit={nextFromStep1} className="space-y-4">
            <label className="block text-sm font-medium text-porter-text-primary">
              Store name
              <input required value={storeName} onChange={(e) => setStoreName(e.target.value)} className={fieldClass} autoComplete="organization" />
            </label>
            <div>
              <p className="text-sm font-medium text-porter-text-primary">Store category</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {STORE_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setStoreCategory(cat)}
                    className={`min-h-9 rounded-[var(--po-radius-pill)] border px-3 text-sm font-semibold ${
                      storeCategory === cat
                        ? "border-porter-green-500 bg-[var(--po-primary-soft)] text-porter-green-600"
                        : "border-porter-bg-border text-porter-text-secondary"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm font-medium text-porter-text-primary">
              Owner name (optional)
              <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} className={fieldClass} autoComplete="name" />
            </label>
            <label className="block text-sm font-medium text-porter-text-primary">
              Store phone / WhatsApp
              <input required placeholder="+9198…" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={fieldClass} inputMode="tel" autoComplete="tel" />
            </label>
            <label className="block text-sm font-medium text-porter-text-primary">
              City
              <input value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass} autoComplete="address-level2" />
            </label>
            <label className="block text-sm font-medium text-porter-text-primary">
              Area / locality
              <input value={locality} onChange={(e) => setLocality(e.target.value)} className={fieldClass} />
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
            <h2 className="text-heading text-porter-text-primary">Delivery and payment</h2>
            <p className="mt-1 text-body">Choose how customers can receive orders and pay.</p>
          </div>
          <div>
            <p className="text-sm font-medium text-porter-text-primary">Delivery mode</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["pickup", "delivery", "both"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDeliveryMode(mode)}
                  className={`min-h-9 rounded-[var(--po-radius-pill)] border px-3 text-sm font-semibold capitalize ${
                    deliveryMode === mode
                      ? "border-porter-green-500 bg-[var(--po-primary-soft)] text-porter-green-600"
                      : "border-porter-bg-border text-porter-text-secondary"
                  }`}
                >
                  {mode === "both" ? "Pickup & delivery" : mode}
                </button>
              ))}
            </div>
          </div>
          <label className="block text-sm font-medium text-porter-text-primary">
            Minimum order (₹, optional)
            <input value={minOrder} onChange={(e) => setMinOrder(e.target.value)} className={fieldClass} inputMode="decimal" />
          </label>
          <label className="block text-sm font-medium text-porter-text-primary">
            Delivery fee (₹, optional)
            <input value={deliveryFee} onChange={(e) => setDeliveryFee(e.target.value)} className={fieldClass} inputMode="decimal" />
          </label>
          <label className="block text-sm font-medium text-porter-text-primary">
            Delivery areas
            <textarea value={zones} onChange={(e) => setZones(e.target.value)} rows={3} className={`${fieldClass} resize-y`} />
          </label>
          <div className="flex flex-wrap gap-3">
            <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} className="h-5 w-5" />
              COD enabled
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={upiEnabled} onChange={(e) => setUpiEnabled(e.target.checked)} className="h-5 w-5" />
              UPI enabled
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 3 && (
        <Card padding="lg" className="space-y-4">
          <div>
            <h2 className="text-heading text-porter-text-primary">Add first products</h2>
            <p className="mt-1 text-body">You can add inventory now or skip — Porter works with manual orders and store links either way.</p>
          </div>
          <div className="grid gap-2">
            {[
              { key: "manual" as const, title: "Add manually", desc: "Open inventory after setup" },
              { key: "csv" as const, title: "Import CSV", desc: "Bulk upload from spreadsheet" },
              { key: "sample" as const, title: "Use sample inventory", desc: "Demo products to explore" },
              { key: "skip" as const, title: "Skip for now", desc: "Recommended if you are still setting up" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setProductsChoice(opt.key)}
                className={`rounded-[var(--po-radius-md)] border p-4 text-left ${
                  productsChoice === opt.key
                    ? "border-porter-green-500 bg-[var(--po-primary-soft)]"
                    : "border-porter-bg-border bg-porter-bg-surface"
                }`}
              >
                <p className="font-semibold text-porter-text-primary">{opt.title}</p>
                <p className="mt-1 text-sm text-porter-text-muted">{opt.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" className="flex-1" onClick={() => setStep(4)}>
              Continue
            </Button>
          </div>
        </Card>
      )}

      {step === 4 && (
        <Card padding="lg" className="space-y-4">
          <HeroCard
            title="Start without WhatsApp automation"
            description="You can use Porter with manual orders and store links now. Connect WhatsApp automation later."
            variant="orange"
            actions={
              <Button type="button" className="w-full sm:w-auto" onClick={() => setStep(5)}>
                Continue without automation
              </Button>
            }
          />
          <button
            type="button"
            className="text-sm font-semibold text-porter-green-600 underline-offset-2 hover:underline"
            onClick={() => setShowAdvanced((v) => !v)}
          >
            {showAdvanced ? "Hide advanced Meta API setup" : "Open advanced setup — Meta Cloud API"}
          </button>
          {showAdvanced ? (
            <div className="space-y-3 rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-raised p-4">
              <p className="text-sm text-porter-text-muted">
                Only edit these if you know your Meta Business setup. Wrong values can stop automated replies.
              </p>
              <label className="block text-sm font-medium">
                Phone number ID
                <input value={metaPhoneId} onChange={(e) => setMetaPhoneId(e.target.value)} className={fieldClass} />
              </label>
              <label className="block text-sm font-medium">
                Permanent access token
                <input type="password" value={metaToken} onChange={(e) => setMetaToken(e.target.value)} className={fieldClass} />
              </label>
              <Button type="button" variant="secondary" loading={testingMeta} onClick={() => void testMeta()} disabled={!metaPhoneId.trim() || !metaToken.trim()}>
                Test connection
              </Button>
              {metaOk ? <p className="text-sm text-porter-green-600">{metaOk}</p> : null}
              <Button type="button" className="w-full" onClick={() => setStep(5)}>
                Save and continue
              </Button>
            </div>
          ) : null}
          {error ? <p className="text-sm text-porter-orange-500">{error}</p> : null}
          <Button type="button" variant="ghost" onClick={() => setStep(3)}>
            Back
          </Button>
        </Card>
      )}

      {step === 5 && (
        <Card padding="lg" className="space-y-4">
          <div>
            <h2 className="text-heading text-porter-text-primary">Review and launch</h2>
            <p className="mt-1 text-body">Everything looks ready. Open your dashboard to start receiving orders.</p>
          </div>
          <ul className="space-y-2 text-sm text-porter-text-secondary">
            <li className="flex gap-2"><span className="text-porter-green-600">✓</span> Store profile complete</li>
            <li className="flex gap-2"><span className="text-porter-green-600">✓</span> Delivery configured</li>
            <li className="flex gap-2"><span className="text-porter-green-600">✓</span> Payment options selected</li>
            <li className="flex gap-2"><span className="text-porter-green-600">✓</span> Products {productsChoice === "skip" ? "skipped for now" : `— ${productsChoice}`}</li>
            <li className="flex gap-2"><span className="text-porter-green-600">✓</span> WhatsApp {metaPhoneId ? "configured" : "automation skipped"}</li>
          </ul>
          {error ? <p className="text-sm text-porter-orange-500">{error}</p> : null}
          <StickyBottomAction className="-mx-4 rounded-none border-x-0">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(4)}>
                Back
              </Button>
              <Button type="button" className="flex-1" size="lg" loading={loading} onClick={() => void finish()}>
                Open dashboard
              </Button>
            </div>
          </StickyBottomAction>
        </Card>
      )}
    </div>
  );
}
