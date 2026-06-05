"use client";

import { stockDisplayLabel } from "@/lib/inventory";
import {
  loadStorefrontCart,
  mergeCartLine,
  reconcileCartWithCatalog,
  saveStorefrontCart,
  type StorefrontCartLine,
} from "@/lib/storefront-cart";
import { useEffect, useMemo, useState } from "react";

export type PublicStore = {
  id: string;
  store_name: string;
  store_slug: string;
  city: string | null;
  cod_enabled: boolean;
  delivery_enabled: boolean;
  pickup_enabled: boolean;
};

export type PublicProduct = {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock_quantity: number;
  in_stock: boolean;
};

export default function StorefrontClient({ store, products }: { store: PublicStore; products: PublicProduct[] }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<StorefrontCartLine[]>([]);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [placedTrack, setPlacedTrack] = useState<string | null>(null);

  useEffect(() => {
    const loaded = loadStorefrontCart(store.store_slug);
    const { cart: next, removed, priceChanged } = reconcileCartWithCatalog(loaded, products);
    setCart(next);
    if (removed.length) setCartNotice(`Removed unavailable: ${removed.join(", ")}`);
    else if (priceChanged.length) setCartNotice(`Prices updated for: ${priceChanged.join(", ")}`);
  }, [store.store_slug, products]);

  useEffect(() => {
    saveStorefrontCart(store.store_slug, cart);
  }, [cart, store.store_slug]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [products, search]);

  const total = cart.reduce((s, l) => s + l.qty * Number(l.price), 0);

  function addToCart(p: PublicProduct) {
    setCart((c) =>
      mergeCartLine(c, {
        productId: p.id,
        name: p.name,
        price: Number(p.price),
        unit: p.unit,
        stock_quantity: p.stock_quantity,
        in_stock: p.in_stock,
      }),
    );
    setCartNotice(null);
  }

  function setQty(productId: string, qty: number) {
    setCart((c) => {
      if (qty <= 0) return c.filter((l) => l.productId !== productId);
      return c.map((l) => (l.productId === productId ? { ...l, qty } : l));
    });
  }

  async function placeOrder() {
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/public/stores/${store.store_slug}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name,
        customerPhone: phone,
        fulfillmentType: "pickup",
        paymentMethod: store.cod_enabled ? "cod" : "razorpay",
        items: cart.map((l) => ({ productId: l.productId, quantity: l.qty })),
      }),
    });
    const json = (await res.json()) as { data?: { trackUrl?: string }; error?: { message?: string } };
    setBusy(false);
    if (!res.ok) {
      setErr(json.error?.message ?? "Order failed");
      return;
    }
    setPlacedTrack(json.data?.trackUrl ?? "");
    setCart([]);
    saveStorefrontCart(store.store_slug, []);
    setCheckout(false);
  }

  if (placedTrack !== null) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-porter-bg-base px-6 py-12 text-center safe-bottom">
        <div className="max-w-sm space-y-4 rounded-[var(--po-radius-xl)] border border-porter-bg-border bg-porter-bg-surface p-8 shadow-card">
          <h1 className="text-2xl font-bold text-porter-green-600">Order placed</h1>
          <p className="text-sm text-porter-text-secondary">We sent your order to the store.</p>
          {placedTrack ? (
            <a href={placedTrack} className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--po-radius-pill)] bg-porter-green-500 px-6 font-semibold text-white">
              Track order
            </a>
          ) : null}
          <button
            type="button"
            className="min-h-11 w-full text-sm font-semibold text-porter-green-600"
            onClick={() => setPlacedTrack(null)}
          >
            Continue shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-porter-bg-base pb-28 safe-bottom">
      <header className="safe-top border-b border-porter-bg-border bg-gradient-to-br from-porter-bg-surface to-[var(--po-bg-warm)] px-4 py-5 shadow-card">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--po-radius-md)] bg-[var(--po-primary-soft)] text-lg font-bold text-porter-green-600">
            {store.store_name.charAt(0).toUpperCase()}
          </span>
          <div>
            <h1 className="text-xl font-semibold text-porter-text-primary">{store.store_name}</h1>
            <p className="text-sm text-porter-text-muted">
              {store.city ?? "Local store"}
              {store.pickup_enabled && store.delivery_enabled
                ? " · Pickup & delivery"
                : store.delivery_enabled
                  ? " · Delivery"
                  : " · Pickup"}
            </p>
          </div>
        </div>
        <input
          className="mt-4 w-full min-h-12 rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-surface px-3 text-base text-porter-text-primary outline-none focus:border-porter-green-500 focus:ring-2 focus:ring-porter-green-500/20"
          placeholder="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search products"
        />
      </header>

      {cartNotice ? (
        <p className="mx-4 mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
          {cartNotice}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <p className="text-lg font-medium text-porter-text-primary">
            {products.length === 0 ? "No products available" : "No matches for your search"}
          </p>
          <p className="mt-2 text-sm text-porter-text-muted">
            {products.length === 0 ? "Check back soon or message the store on WhatsApp." : "Try a different search term."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 p-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id} className="rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-surface p-4 shadow-card">
              <p className="font-semibold text-porter-text-primary">{p.name}</p>
              <p className="text-porter-green-600">₹{p.price}</p>
              <p className="text-xs text-porter-text-muted">{stockDisplayLabel(p.stock_quantity ?? 0)}</p>
              <button
                type="button"
                className="mt-3 min-h-11 rounded-[var(--po-radius-sm)] bg-porter-green-500 px-4 py-2 text-base font-semibold text-white disabled:opacity-50"
                disabled={!p.in_stock}
                onClick={() => addToCart(p)}
              >
                Add
              </button>
            </li>
          ))}
        </ul>
      )}

      {cart.length > 0 ? (
        <div className="mx-4 mb-4 rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-surface p-3 shadow-card">
          <p className="text-sm font-semibold">Cart</p>
          <ul className="mt-2 space-y-2">
            {cart.map((l) => (
              <li key={l.productId} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {l.name} × {l.qty}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="h-8 w-8 rounded border"
                    aria-label={`Decrease ${l.name}`}
                    onClick={() => setQty(l.productId, l.qty - 1)}
                  >
                    −
                  </button>
                  <button
                    type="button"
                    className="h-8 w-8 rounded border"
                    aria-label={`Increase ${l.name}`}
                    onClick={() => setQty(l.productId, l.qty + 1)}
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {cart.length > 0 ? (
        <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-20">
          <button
            type="button"
            className="flex min-h-14 w-full items-center justify-between rounded-[var(--po-radius-pill)] border border-porter-bg-border bg-porter-bg-surface/95 px-5 shadow-[var(--po-shadow-floating)] backdrop-blur"
            onClick={() => setCheckout(true)}
          >
            <span className="text-sm font-semibold text-porter-text-primary">
              {cart.reduce((n, l) => n + l.qty, 0)} items · ₹{Math.round(total).toLocaleString("en-IN")}
            </span>
            <span className="rounded-[var(--po-radius-pill)] bg-porter-green-500 px-4 py-2 text-sm font-bold text-white">
              View cart
            </span>
          </button>
        </div>
      ) : null}

      {checkout ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md space-y-3 rounded-[var(--po-radius-lg)] bg-porter-bg-surface p-6 safe-bottom shadow-modal">
            <input
              className="w-full rounded border px-3 py-2 text-base"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-label="Your name"
            />
            <input
              className="w-full rounded border px-3 py-2 text-base"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              aria-label="Phone number"
              inputMode="tel"
            />
            {err ? <p className="text-sm text-red-600" role="alert">{err}</p> : null}
            <button
              type="button"
              className="min-h-11 w-full rounded-[var(--po-radius-sm)] bg-porter-green-500 py-2 text-base font-semibold text-white"
              disabled={busy}
              onClick={() => void placeOrder()}
            >
              Place order
            </button>
            <button type="button" className="min-h-11 w-full text-sm text-porter-text-muted" onClick={() => setCheckout(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
