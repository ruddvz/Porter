"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

type Product = {
  id: string;
  name: string;
  aliases: string[];
  price: number;
  unit: string;
  category: string;
  inStock: boolean;
};

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Potato",
    aliases: ["bataka", "aloo"],
    price: 28,
    unit: "kg",
    category: "Vegetables",
    inStock: true,
  },
  {
    id: "2",
    name: "Sunflower oil",
    aliases: ["tael", "oil"],
    price: 220,
    unit: "litre",
    category: "Grocery",
    inStock: true,
  },
  {
    id: "3",
    name: "Amul butter",
    aliases: ["butter"],
    price: 56,
    unit: "piece",
    category: "Dairy",
    inStock: false,
  },
];

const categories = ["All", "Vegetables", "Grocery", "Dairy", "Other"];

export default function InventoryPage() {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    aliases: "",
    category: "Vegetables",
    price: "",
    unit: "kg",
    inStock: true,
  });

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchQ =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.aliases.some((a) => a.toLowerCase().includes(q));
    const matchC = cat === "All" || p.category === cat;
    return matchQ && matchC;
  });

  const openAdd = () => {
    setEditing(null);
    setForm({
      name: "",
      aliases: "",
      category: "Vegetables",
      price: "",
      unit: "kg",
      inStock: true,
    });
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      aliases: p.aliases.join(", "),
      category: p.category,
      price: String(p.price),
      unit: p.unit,
      inStock: p.inStock,
    });
    setModalOpen(true);
  };

  const saveProduct = () => {
    const price = parseFloat(form.price);
    if (!form.name.trim() || !Number.isFinite(price) || price <= 0) return;
    const aliases = form.aliases
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (editing) {
      setProducts((list) =>
        list.map((x) =>
          x.id === editing.id
            ? { ...x, name: form.name.trim(), aliases, category: form.category, price, unit: form.unit, inStock: form.inStock }
            : x
        )
      );
    } else {
      setProducts((list) => [
        ...list,
        {
          id: String(Date.now()),
          name: form.name.trim(),
          aliases,
          category: form.category,
          price,
          unit: form.unit,
          inStock: form.inStock,
        },
      ]);
    }
    setModalOpen(false);
  };

  const toggleStock = (id: string) => {
    setProducts((list) =>
      list.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const bulkOut = () => {
    setProducts((list) =>
      list.map((p) => (selected.has(p.id) ? { ...p, inStock: false } : p))
    );
    setSelected(new Set());
  };

  return (
    <div className="space-y-space-4">
      <div className="flex flex-col gap-space-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="w-full max-w-md">
          <Input label="Search products" variant="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-space-2">
          <Button type="button" variant="secondary" onClick={() => setEditMode((e) => !e)}>
            {editMode ? "Done" : "Edit mode"}
          </Button>
          <Button type="button" variant="primary" onClick={openAdd}>
            Add product
          </Button>
        </div>
      </div>

      <div className="flex gap-space-2 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={
              cat === c
                ? "min-h-11 shrink-0 rounded-full bg-porter-green-500 px-space-4 text-sm font-semibold text-porter-bg-base"
                : "min-h-11 shrink-0 rounded-full border border-porter-bg-border px-space-4 text-sm text-porter-text-secondary"
            }
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-space-3 md:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <Card key={p.id} variant="glow" padding="md" className="relative">
            {editMode && (
              <label className="absolute left-space-2 top-space-2 flex min-h-11 min-w-11 cursor-pointer items-center justify-center">
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggleSelect(p.id)}
                  className="h-5 w-5 accent-porter-green-500"
                />
              </label>
            )}
            <div className="flex justify-end gap-space-1">
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-porter-text-muted hover:bg-porter-bg-raised hover:text-porter-text-primary"
                aria-label="Edit"
                onClick={() => openEdit(p)}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-porter-text-muted hover:bg-porter-bg-raised hover:text-porter-status-cancelled"
                aria-label="Delete"
                onClick={() => {
                  setEditing(p);
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="pr-8 text-title text-porter-text-primary">{p.name}</p>
            <p className="mt-space-2 flex flex-wrap gap-1">
              {p.aliases.map((a) => (
                <span key={a} className="rounded-md bg-porter-bg-raised px-space-2 py-0.5 text-xs text-porter-text-muted">
                  {a}
                </span>
              ))}
            </p>
            <p className="mt-space-3 text-display text-porter-green-400 leading-none">
              ₹{p.price}
              <span className="ml-1 font-sans text-sm font-normal text-porter-text-secondary">/ {p.unit}</span>
            </p>
            <div className="mt-space-2">
              <Badge variant="plan" plan="starter" label={p.category} type="square" />
            </div>
            <div className="mt-space-4 flex items-center justify-between gap-space-2">
              <span className="text-label text-porter-text-muted">In stock</span>
              <button
                type="button"
                role="switch"
                aria-checked={p.inStock}
                onClick={() => toggleStock(p.id)}
                className={
                  p.inStock
                    ? "min-h-11 min-w-[52px] rounded-full bg-porter-green-500 px-space-3 text-xs font-bold text-porter-bg-base"
                    : "min-h-11 min-w-[52px] rounded-full bg-porter-bg-border px-space-3 text-xs font-bold text-porter-text-muted"
                }
              >
                {p.inStock ? "ON" : "OFF"}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {editMode && selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-porter-bg-border bg-porter-bg-raised p-space-4 shadow-modal lg:left-[240px]">
          <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-space-3">
            <span className="text-body font-semibold text-porter-text-primary">{selected.size} selected</span>
            <div className="flex flex-wrap gap-space-2">
              <Button type="button" variant="secondary" onClick={bulkOut}>
                Mark out of stock
              </Button>
              <Button type="button" variant="danger" onClick={() => setDeleteOpen(true)}>
                Delete selected
              </Button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit product" : "Add product"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveProduct}>Save</Button>
          </>
        }
      >
        <div className="space-y-space-4">
          <Input label="Name" variant="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input
            label="Aliases"
            variant="text"
            placeholder="bataka, aloo, potato"
            value={form.aliases}
            onChange={(e) => setForm((f) => ({ ...f, aliases: e.target.value }))}
            hint="Comma-separated — helps the bot match customer wording."
          />
          <Input
            label="Category"
            variant="select"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            options={categories.filter((c) => c !== "All").map((c) => ({ value: c, label: c }))}
          />
          <Input
            label="Price (₹)"
            variant="number"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          />
          <Input
            label="Unit"
            variant="select"
            value={form.unit}
            onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
            options={[
              { value: "kg", label: "kg" },
              { value: "litre", label: "litre" },
              { value: "pkt", label: "pkt" },
              { value: "piece", label: "piece" },
              { value: "dozen", label: "dozen" },
              { value: "box", label: "box" },
            ]}
          />
          <label className="flex min-h-11 cursor-pointer items-center gap-space-3 text-body text-porter-text-primary">
            <input
              type="checkbox"
              checked={form.inStock}
              onChange={(e) => setForm((f) => ({ ...f, inStock: e.target.checked }))}
              className="h-5 w-5 accent-porter-green-500"
            />
            In stock
          </label>
        </div>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete product?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (selected.size > 0) {
                  setProducts((list) => list.filter((p) => !selected.has(p.id)));
                  setSelected(new Set());
                } else if (editing) {
                  setProducts((list) => list.filter((p) => p.id !== editing.id));
                }
                setDeleteOpen(false);
              }}
            >
              Delete
            </Button>
          </>
        }
      >
        <p className="text-body text-porter-text-secondary">
          {selected.size > 0
            ? `This will remove ${selected.size} product(s).`
            : "This will remove the product from your catalog."}
        </p>
      </Modal>
    </div>
  );
}
