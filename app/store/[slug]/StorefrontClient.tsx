"use client";

import { stockDisplayLabel } from "@/lib/inventory";
import { useMemo, useState } from "react";

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

type CartLine = { product: PublicProduct; qty: number };

export default function StorefrontClient({ store, products }: { store: PublicStore; products: PublicProduct[] }) {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [placedTrack, setPlacedTrack] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [products, search]);

  const total = cart.reduce((s, l) => s + l.qty * Number(l.product.price), 0);

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
        items: cart.map((l) => ({ productId: l.product.id, quantity: l.qty })),
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

  const Wrapper = ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  );

  return (
    <main className="min-h-screen bg-[#FFFAF2] pb-24">
      <header className="border-b border-[#EADFCE] bg-white px-4 py-4">
        <h1 className="text-xl font-semibold">{store.store_name}</h1>
        <input
          className="mt-3 w-full rounded-lg border px-3 py-2 text-sm"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </header>
      <ul className="grid gap-3 p-4 sm:grid-cols-2">
        {filtered.map((p) => (
          <li key={p.id} className="rounded-xl border bg-white p-4">
            <p className="font-medium">{p.name}</p>
            <p className="text-[#0F7A3A]">₹{p.price}</p>
            <p className="text-xs">{stockDisplayLabel(p.stock_quantity ?? 0)}</p>
            <button
              type="button"
              className="mt-2 rounded-lg bg-[#0F7A3A] px-3 py-1 text-sm text-white"
              disabled={!p.in_stock}
              onClick={() => setCart((c) => [...c, { product: p, qty: 1 }])}
            >
              Add
            </button>
          </li>
        ))}
      </ul>
      <Wrapper className="fixed bottom-0 left-0 right-0 border-t bg-white p-4">
        <button type="button" className="w-full rounded-xl bg-[#F26B00] py-3 text-white" onClick={() => setCheckout(true)}>
          Checkout ₹{Math.round(total)}
        </button>
      </Wrapper>
      {checkout ? (
        <Wrapper className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Wrapper className="w-full max-w-md space-y-3 rounded-xl bg-white p-6">
            <input className="w-full rounded border px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full rounded border px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            <button type="button" className="w-full rounded-lg bg-[#0F7A3A] py-2 text-white" disabled={busy} onClick={() => void placeOrder()}>
              Place order
            </button>
          </Wrapper>
        </Wrapper>
      ) : null}
    </main>
  );
}
