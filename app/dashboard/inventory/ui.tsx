"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Product } from "@/types";
import { useMemo, useState } from "react";

const UNITS = ["kg", "pkt", "litre", "piece", "dozen"] as const;

/** Product grid with modal add/edit, bulk stock toggle, and delete. */
export default function InventoryClient({ initialProducts }: { initialProducts: Product[] }) {
  const supabase = createSupabaseBrowserClient();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<Product | "new" | null>(null);

  const categories = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => {
      if (p.category) s.add(p.category);
    });
    return Array.from(s);
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      const q = search.trim().toLowerCase();
      if (!q) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      return (p.aliases ?? []).some((a) => a.toLowerCase().includes(q));
    });
  }, [products, search, category]);

  function toggleSelect(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  function selectAll() {
    const m: Record<string, boolean> = {};
    filtered.forEach((p) => {
      m[p.id] = true;
    });
    setSelected(m);
  }

  function clearSelect() {
    setSelected({});
  }

  async function bulkOutOfStock() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return;
    if (!confirm(`Mark ${ids.length} products out of stock?`)) return;
    const { error } = await supabase.from("products").update({ in_stock: false }).in("id", ids);
    if (error) alert(error.message);
    else setProducts((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, in_stock: false } : p)));
  }

  async function bulkDelete() {
    const ids = Object.keys(selected).filter((k) => selected[k]);
    if (!ids.length) return;
    if (!confirm(`Delete ${ids.length} products?`)) return;
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) alert(error.message);
    else {
      setProducts((prev) => prev.filter((p) => !ids.includes(p.id)));
      clearSelect();
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="font-display text-3xl text-white">Inventory</h1>
        <button type="button" onClick={() => setModal("new")} className="rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-black">
          Add product
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products or aliases"
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white md:max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-3 py-1 text-xs ${category === "all" ? "bg-[#25D366] text-black" : "bg-white/10 text-white/70"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`rounded-full px-3 py-1 text-xs capitalize ${
                category === c ? "bg-[#25D366] text-black" : "bg-white/10 text-white/70"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={selectAll} className="rounded border border-white/20 px-2 py-1 text-white/70">
          Select all (filtered)
        </button>
        <button type="button" onClick={clearSelect} className="rounded border border-white/20 px-2 py-1 text-white/70">
          Deselect all
        </button>
        <button type="button" onClick={bulkOutOfStock} className="rounded border border-[#FF6B35] px-2 py-1 text-[#FF6B35]">
          Mark selected OOS
        </button>
        <button type="button" onClick={bulkDelete} className="rounded border border-red-500/50 px-2 py-1 text-red-300">
          Delete selected
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl border border-white/10 bg-[#111A14] p-3">
            <div className="flex items-start justify-between gap-2">
              <input type="checkbox" checked={!!selected[p.id]} onChange={() => toggleSelect(p.id)} />
              <div className="flex gap-2">
                <button type="button" className="text-white/50 hover:text-white" onClick={() => setModal(p)} aria-label="Edit">
                  ✎
                </button>
                <button
                  type="button"
                  className="text-white/50 hover:text-red-300"
                  onClick={async () => {
                    if (!confirm("Delete product?")) return;
                    const { error } = await supabase.from("products").delete().eq("id", p.id);
                    if (error) alert(error.message);
                    else setProducts((prev) => prev.filter((x) => x.id !== p.id));
                  }}
                  aria-label="Delete"
                >
                  🗑
                </button>
              </div>
            </div>
            <p className="mt-2 font-semibold text-white">{p.name}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {(p.aliases ?? []).slice(0, 6).map((a) => (
                <span key={a} className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-white/60">
                  {a}
                </span>
              ))}
            </div>
            <p className="mt-2 text-sm text-[#25D366]">
              ₹{p.price} / {p.unit}
            </p>
            {p.category && <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase">{p.category}</span>}
            <label className="mt-3 flex items-center justify-between text-xs text-white/70">
              In stock
              <input
                type="checkbox"
                checked={p.in_stock}
                onChange={async (e) => {
                  const in_stock = e.target.checked;
                  setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, in_stock } : x)));
                  const { error } = await supabase.from("products").update({ in_stock }).eq("id", p.id);
                  if (error) {
                    alert(error.message);
                    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, in_stock: p.in_stock } : x)));
                  }
                }}
                className="h-5 w-5 accent-[#25D366]"
              />
            </label>
          </div>
        ))}
      </div>

      {filtered.length === 0 && <p className="mt-8 text-center text-sm text-white/50">No products match.</p>}

      {modal && (
        <ProductModal
          product={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={(p) => {
            if (modal === "new") setProducts((prev) => [p, ...prev]);
            else setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function ProductModal({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const supabase = createSupabaseBrowserClient();
  const [name, setName] = useState(product?.name ?? "");
  const [aliases, setAliases] = useState((product?.aliases ?? []).join(", "));
  const [category, setCategory] = useState(product?.category ?? "");
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [unit, setUnit] = useState(product?.unit ?? "kg");
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setBusy(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Not signed in");
      setBusy(false);
      return;
    }
    const { data: seller } = await supabase.from("sellers").select("id").eq("user_id", user.id).single();
    if (!seller) {
      setError("No seller profile");
      setBusy(false);
      return;
    }
    const aliasArr = aliases
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const priceNum = parseFloat(price);
    if (!name.trim() || !Number.isFinite(priceNum)) {
      setError("Name and valid price required");
      setBusy(false);
      return;
    }
    const row = {
      seller_id: seller.id,
      name: name.trim(),
      aliases: aliasArr,
      category: category.trim() || null,
      price: priceNum,
      unit,
      in_stock: inStock,
    };
    if (product) {
      const { data, error: err } = await supabase.from("products").update(row).eq("id", product.id).select("*").single();
      setBusy(false);
      if (err) setError(err.message);
      else if (data) onSaved(data as Product);
    } else {
      const { data, error: err } = await supabase.from("products").insert(row).select("*").single();
      setBusy(false);
      if (err) setError(err.message);
      else if (data) onSaved(data as Product);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 md:items-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-2xl border border-white/10 bg-[#111A14] p-5 md:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl text-white">{product ? "Edit product" : "Add product"}</h2>
        <div className="mt-4 space-y-3 text-sm">
          <label className="block">
            <span className="text-white/70">Name *</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
          </label>
          <label className="block">
            <span className="text-white/70">Aliases (comma-separated)</span>
            <input value={aliases} onChange={(e) => setAliases(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
          </label>
          <label className="block">
            <span className="text-white/70">Category</span>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="text-white/70">Price *</span>
              <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white" />
            </label>
            <label className="block">
              <span className="text-white/70">Unit</span>
              <select value={unit} onChange={(e) => setUnit(e.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white">
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex items-center gap-2 text-white/80">
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="accent-[#25D366]" />
            In stock
          </label>
        </div>
        {error && <p className="mt-2 text-sm text-[#FF6B35]">{error}</p>}
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={save} disabled={busy} className="flex-1 rounded-lg bg-[#25D366] py-2 font-semibold text-black">
            Save
          </button>
          <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-white/20 py-2 text-white">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
