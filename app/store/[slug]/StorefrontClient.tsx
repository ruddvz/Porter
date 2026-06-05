"use client";

import {
  CartBar,
  CartSheet,
  CategoryStrip,
  CheckoutSheet,
  ProductCard,
  StoreEmptyState,
  StorefrontSuccess,
  StoreHeader,
  type FulfillmentType,
  type PublicProduct,
  type PublicStore,
  type StorefrontPaymentMethod,
} from "@/components/storefront";
import {
  loadStorefrontCart,
  mergeCartLine,
  reconcileCartWithCatalog,
  saveStorefrontCart,
  type StorefrontCartLine,
} from "@/lib/storefront-cart";
import { useEffect, useMemo, useState } from "react";

export type { PublicProduct, PublicStore };

export default function StorefrontClient({ store, products }: { store: PublicStore; products: PublicProduct[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [cart, setCart] = useState<StorefrontCartLine[]>([]);
  const [cartNotice, setCartNotice] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [fulfillment, setFulfillment] = useState<FulfillmentType>(
    store.delivery_enabled && !store.pickup_enabled ? "delivery" : "pickup",
  );
  const [deliveryArea, setDeliveryArea] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<StorefrontPaymentMethod>(store.cod_enabled ? "cod" : "razorpay");
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

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category?.trim()) set.add(p.category.trim());
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && (p.category?.trim() ?? "") !== category) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q);
    });
  }, [products, search, category]);

  const subtotal = cart.reduce((s, l) => s + l.qty * Number(l.price), 0);
  const deliveryFee =
    fulfillment === "delivery" && store.delivery_fee != null ? Math.max(0, Number(store.delivery_fee)) : 0;
  const itemCount = cart.reduce((n, l) => n + l.qty, 0);

  const qtyByProduct = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of cart) map.set(l.productId, l.qty);
    return map;
  }, [cart]);

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

    const minOrder = store.min_order_amount != null ? Number(store.min_order_amount) : 0;
    if (minOrder > 0 && subtotal < minOrder) {
      setErr(`Minimum order is ₹${Math.round(minOrder).toLocaleString("en-IN")}. Add more items.`);
      setBusy(false);
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setErr("Please enter your name and phone.");
      setBusy(false);
      return;
    }
    if (fulfillment === "delivery" && !address.trim()) {
      setErr("Please enter your delivery address.");
      setBusy(false);
      return;
    }

    const res = await fetch(`/api/public/stores/${store.store_slug}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: name.trim(),
        customerPhone: phone.trim(),
        fulfillmentType: fulfillment,
        deliveryArea: fulfillment === "delivery" ? deliveryArea.trim() || undefined : undefined,
        deliveryAddress: fulfillment === "delivery" ? address.trim() : undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
        items: cart.map((l) => ({ productId: l.productId, quantity: l.qty })),
      }),
    });
    const json = (await res.json()) as { data?: { trackUrl?: string }; error?: { message?: string } };
    setBusy(false);
    if (!res.ok) {
      setErr(json.error?.message ?? "Order failed. Please try again.");
      return;
    }
    setPlacedTrack(json.data?.trackUrl ?? "");
    setCart([]);
    saveStorefrontCart(store.store_slug, []);
    setCheckoutOpen(false);
    setCartOpen(false);
  }

  if (placedTrack !== null) {
    return <StorefrontSuccess trackUrl={placedTrack} onContinue={() => setPlacedTrack(null)} />;
  }

  return (
    <main className="min-h-screen bg-porter-bg-base pb-32 safe-bottom">
      <StoreHeader store={store} search={search} onSearchChange={setSearch} />
      <CategoryStrip categories={categories} active={category} onChange={setCategory} />

      {cartNotice ? (
        <p className="mx-4 mt-3 rounded-[var(--po-radius-md)] bg-[var(--po-warning-soft)] px-3 py-2 text-sm text-porter-orange-600" role="status">
          {cartNotice}
        </p>
      ) : null}

      {products.length === 0 ? (
        <StoreEmptyState variant="no-products" />
      ) : filtered.length === 0 ? (
        <StoreEmptyState
          variant="no-search"
          onClearSearch={() => {
            setSearch("");
            setCategory("all");
          }}
        />
      ) : (
        <ul className="grid gap-3 p-4 md:max-w-2xl md:mx-auto lg:max-w-4xl lg:grid-cols-2">
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              qty={qtyByProduct.get(p.id) ?? 0}
              onAdd={() => addToCart(p)}
              onSetQty={(qty) => setQty(p.id, qty)}
            />
          ))}
        </ul>
      )}

      <CartBar itemCount={itemCount} total={subtotal} onOpenCart={() => setCartOpen(true)} />

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        lines={cart}
        subtotal={subtotal}
        deliveryFee={0}
        onSetQty={setQty}
        onCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
      />

      <CheckoutSheet
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        store={store}
        subtotal={subtotal}
        deliveryFee={deliveryFee}
        name={name}
        phone={phone}
        fulfillment={fulfillment}
        deliveryArea={deliveryArea}
        address={address}
        paymentMethod={paymentMethod}
        notes={notes}
        error={err}
        busy={busy}
        onNameChange={setName}
        onPhoneChange={setPhone}
        onFulfillmentChange={setFulfillment}
        onDeliveryAreaChange={setDeliveryArea}
        onAddressChange={setAddress}
        onPaymentChange={setPaymentMethod}
        onNotesChange={setNotes}
        onPlaceOrder={() => void placeOrder()}
      />
    </main>
  );
}
