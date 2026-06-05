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
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#FFFAF2] p-8">
        <h1 className="text-2xl font-semibold text-[#0F7A3A]">Order placed</h1>
        {placedTrack ? (
          <a href={placedTrack} className="mt-6 text-[#0F7A3A] underline">
            Track order
          </a>
        ) : null}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFFAF2] pb-28 safe-bottom">
      <header className="border-b border-[#EADFCE] bg-white px-4 py-4 safe-top">
        <h1 className="text-xl font-semibold">{store.store_name}</h1>
        <input
          className="mt-3 w-full rounded-lg border px-3 py-2 text-base"
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
          <p className="text-lg font-medium text-[#1a1a1a]">
            {products.length === 0 ? "No products available" : "No matches for your search"}
          </p>
          <p className="mt-2 text-sm text-[#555]">
            {products.length === 0 ? "Check back soon or message the store on WhatsApp." : "Try a different search term."}
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 p-4 sm:grid-cols-2">
          {filtered.map((p) => (
            <li key={p.id} className="rounded-xl border bg-white p-4">
              <p className="font-medium">{p.name}</p>
              <p className="text-[#0F7A3A]">₹{p.price}</p>
              <p className="text-xs text-[#555]">{stockDisplayLabel(p.stock_quantity ?? 0)}</p>
              <button
                type="button"
                className="mt-2 rounded-lg bg-[#0F7A3A] px-3 py-2 text-base text-white disabled:opacity-50"
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
        <div className="mx-4 mb-4 rounded-xl border bg-white p-3">
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

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 safe-bottom">
        <button
          type="button"
          className="w-full rounded-xl bg-[#F26B00] py-3 text-base text-white disabled:opacity-50"
          disabled={cart.length === 0}
          onClick={() => setCheckout(true)}
        >
          Checkout ₹{Math.round(total)}
        </button>
      </div>

      {checkout ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-md space-y-3 rounded-xl bg-white p-6 safe-bottom">
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
              className="w-full rounded-lg bg-[#0F7A3A] py-2 text-base text-white"
              disabled={busy}
              onClick={() => void placeOrder()}
            >
              Place order
            </button>
            <button type="button" className="w-full text-sm text-[#555]" onClick={() => setCheckout(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
