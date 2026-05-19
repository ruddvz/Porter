"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Product, Seller } from "@/types";
import { filterProductsByFuzzySearch } from "@/lib/fuzzy";
import { isProductListedForBot, productListingHint } from "@/lib/product-catalog";
import { checkGate } from "@/lib/plan-gates";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { Pencil, Trash2, GripVertical } from "lucide-react";
import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/cn";
import InventoryLedgerPanel from "@/components/inventory/InventoryLedgerPanel";

const PRESET_CATEGORIES = ["Vegetables", "Dairy", "Staples", "Beverages", "Snacks", "Household", "Other"];
const UNITS = ["kg", "litre", "pkt", "piece", "dozen", "box"] as const;

const PRESET_SET = new Set(PRESET_CATEGORIES.map((c) => c.toLowerCase()));

function stockLevelLabel(p: Product): string | null {
  const sq = p.stock_quantity ?? (p.in_stock ? 1 : 0);
  if (sq <= 0) return "Out of stock";
  if (sq <= 5) return "Low stock";
  return null;
}

function stockLevelVariant(p: Product): "cancelled" | "cod" {
  const sq = p.stock_quantity ?? (p.in_stock ? 1 : 0);
  return sq <= 0 ? "cancelled" : "cod";
}

function SortableProductListRow({
  product: p,
  editMode,
  selected,
  toggleSelect,
  onEdit,
  onDelete,
  supabase,
  setProducts,
  toast,
}: {
  product: Product;
  editMode: boolean;
  selected: Record<string, boolean>;
  toggleSelect: (id: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  supabase: ReturnType<typeof createSupabaseBrowserClient>;
  setProducts: Dispatch<SetStateAction<Product[]>>;
  toast: (msg: string, variant: "success" | "error") => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-porter-bg-border bg-porter-bg-surface px-3 py-3",
        isDragging && "opacity-70 ring-2 ring-porter-green-500/40",
      )}
    >
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-porter-text-muted hover:bg-porter-bg-raised"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>
      {editMode && (
        <input type="checkbox" checked={!!selected[p.id]} onChange={() => toggleSelect(p.id)} className="h-5 w-5 accent-porter-green-500" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-porter-text-primary">{p.name}</p>
        <p className="text-xs text-porter-text-muted">
          ₹{p.price} / {p.unit}
          {p.category ? ` · ${p.category}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-porter-text-muted hover:bg-porter-bg-raised"
          aria-label="Edit"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-porter-text-muted hover:text-porter-status-cancelled"
          aria-label="Delete"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <label className="hidden sm:flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-porter-bg-border bg-porter-bg-raised px-2">
        <span className="text-xs text-porter-text-muted">Bot</span>
        <input
          type="checkbox"
          checked={isProductListedForBot(p)}
          onChange={async (e) => {
            const listed = e.target.checked;
            const snapshot = {
              in_stock: p.in_stock,
              is_active: p.is_active !== false,
              stock_quantity: p.stock_quantity ?? (p.in_stock ? 1 : 0),
            };
            const next = listed
              ? { is_active: true, stock_quantity: Math.max(1, snapshot.stock_quantity || 1), in_stock: true }
              : { is_active: false, stock_quantity: 0, in_stock: false };
            setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, ...next } : x)));
            const { error } = await supabase.from("products").update(next).eq("id", p.id);
            if (error) {
              setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, ...snapshot } : x)));
              toast(error.message, "error");
            }
          }}
          className="h-5 w-5 accent-porter-green-500"
        />
      </label>
    </div>
  );
}

export default function InventoryClient({ seller, initialProducts }: { seller: Seller; initialProducts: Product[] }) {
  const supabase = createSupabaseBrowserClient();
  const { push: toast } = useToast();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | "all">("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<Product | "new" | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [bulkPriceOpen, setBulkPriceOpen] = useState(false);
  const [bulkPriceInput, setBulkPriceInput] = useState("");
  const [bulkCategoryOpen, setBulkCategoryOpen] = useState(false);
  const [bulkCategoryPreset, setBulkCategoryPreset] = useState(() => PRESET_CATEGORIES[0] ?? "Other");
  const [bulkCategoryCustom, setBulkCategoryCustom] = useState("");
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  type SortKey = "name" | "price_asc" | "price_desc" | "stock_low" | "category" | "custom";
  const [sortBy, setSortBy] = useState<SortKey>("name");

  const categories = useMemo(() => {
    const s = new Set<string>();
    products.forEach((p) => {
      if (p.category) s.add(p.category);
    });
    return Array.from(s);
  }, [products]);

  const filtered = useMemo(() => {
    const byCat = products.filter((p) => (category === "all" ? true : p.category === category));
    return filterProductsByFuzzySearch(byCat, search);
  }, [products, search, category]);

  const sortedFiltered = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price_asc":
          return Number(a.price) - Number(b.price);
        case "price_desc":
          return Number(b.price) - Number(a.price);
        case "stock_low":
          return (a.stock_quantity ?? (a.in_stock ? 1 : 0)) - (b.stock_quantity ?? (b.in_stock ? 1 : 0));
        case "category":
          return (a.category ?? "").localeCompare(b.category ?? "") || a.name.localeCompare(b.name);
        case "custom":
          return ((a.sort_order ?? 0) - (b.sort_order ?? 0)) || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    return arr;
  }, [filtered, sortBy]);

  const selectedIds = Object.keys(selected).filter((k) => selected[k]);
  const selectedCount = selectedIds.length;

  const productSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const nextSortOrder = useMemo(() => products.reduce((m, p) => Math.max(m, p.sort_order ?? 0), 0) + 1, [products]);

  async function persistSortOrder(ordered: Product[]) {
    await Promise.all(ordered.map((p, i) => supabase.from("products").update({ sort_order: i }).eq("id", p.id)));
  }

  function onProductDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sortedFiltered.map((p) => p.id);
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(sortedFiltered, oldIndex, newIndex);
    setProducts((prev) => {
      const rank = new Map(reordered.map((p, i) => [p.id, i]));
      return prev.map((p) => (rank.has(p.id) ? { ...p, sort_order: rank.get(p.id)! } : p));
    });
    void persistSortOrder(reordered);
  }

  function toggleSelect(id: string) {
    setSelected((s) => ({ ...s, [id]: !s[id] }));
  }

  async function bulkOutOfStock() {
    if (!selectedIds.length) return;
    const prev = products;
    setProducts((p) => p.map((x) => (selectedIds.includes(x.id) ? { ...x, in_stock: false, is_active: false, stock_quantity: 0 } : x)));
    const { error } = await supabase
      .from("products")
      .update({ in_stock: false, is_active: false, stock_quantity: 0 })
      .in("id", selectedIds);
    if (error) {
      setProducts(prev);
      toast(error.message, "error");
    } else {
      toast("Marked out of stock", "success");
      setSelected({});
    }
  }

  async function bulkSetPrice() {
    const n = parseFloat(bulkPriceInput);
    if (!selectedIds.length || !Number.isFinite(n) || n <= 0) {
      toast("Enter a valid price greater than zero.", "error");
      return;
    }
    const prev = products;
    setProducts((p) => p.map((x) => (selectedIds.includes(x.id) ? { ...x, price: n } : x)));
    const { error } = await supabase.from("products").update({ price: n }).in("id", selectedIds);
    if (error) {
      setProducts(prev);
      toast(error.message, "error");
    } else {
      toast(`Updated price for ${selectedIds.length} products`, "success");
      setBulkPriceOpen(false);
      setBulkPriceInput("");
      setSelected({});
    }
  }

  async function bulkSetCategory() {
    const cat = bulkCategoryCustom.trim() || bulkCategoryPreset;
    if (!selectedIds.length) return;
    const prev = products;
    setProducts((p) => p.map((x) => (selectedIds.includes(x.id) ? { ...x, category: cat } : x)));
    const { error } = await supabase.from("products").update({ category: cat }).in("id", selectedIds);
    if (error) {
      setProducts(prev);
      toast(error.message, "error");
    } else {
      toast(`Updated category for ${selectedIds.length} products`, "success");
      setBulkCategoryOpen(false);
      setBulkCategoryCustom("");
      setSelected({});
    }
  }

  async function bulkDelete() {
    if (!selectedIds.length) return;
    const prev = products;
    setProducts((p) => p.filter((x) => !selectedIds.includes(x.id)));
    const { error } = await supabase.from("products").delete().in("id", selectedIds);
    if (error) {
      setProducts(prev);
      toast(error.message, "error");
    } else {
      toast("Products deleted", "success");
      setSelected({});
      setBulkDeleteOpen(false);
    }
  }

  return (
    <div className="space-y-4 px-3 py-4 md:px-6 md:py-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Input.Text
          id="inv-search"
          label="Search"
          inputVariant="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Products, aliases, category"
          className="md:max-w-md"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Input.Select
            id="inv-sort"
            label="Sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="min-w-[160px]"
          >
            <option value="name">Name (A–Z)</option>
            <option value="category">Category</option>
            <option value="price_asc">Price (low → high)</option>
            <option value="price_desc">Price (high → low)</option>
            <option value="stock_low">Stock (low first)</option>
            <option value="custom">Custom order (drag)</option>
          </Input.Select>
          <Button type="button" variant={editMode ? "primary" : "secondary"} onClick={() => setEditMode((v) => !v)}>
            Edit mode
          </Button>
          <Button type="button" onClick={() => setModal("new")}>
            Add product
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setCategory("all")}
          className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
            category === "all"
              ? "border-porter-green-500 bg-porter-green-500/15 text-porter-green-400"
              : "border-porter-bg-border bg-porter-bg-surface text-porter-text-secondary"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold capitalize ${
              category === c ? "border-porter-green-500 bg-porter-green-500/15 text-porter-green-400" : "border-porter-bg-border bg-porter-bg-surface text-porter-text-secondary"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {sortBy === "custom" ? (
        <div className="space-y-2">
          <p className="text-xs text-porter-text-muted">Drag rows to reorder — order is saved for WhatsApp-style listings.</p>
          <DndContext sensors={productSensors} collisionDetection={closestCenter} onDragEnd={onProductDragEnd}>
            <SortableContext items={sortedFiltered.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedFiltered.map((p) => (
                  <SortableProductListRow
                    key={p.id}
                    product={p}
                    editMode={editMode}
                    selected={selected}
                    toggleSelect={toggleSelect}
                    onEdit={() => setModal(p)}
                    onDelete={() => setDeleteProduct(p)}
                    supabase={supabase}
                    setProducts={setProducts}
                    toast={toast}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      ) : (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {sortedFiltered.map((p) => (
          <Card key={p.id} variant="glow" padding="md" className="relative">
            {editMode && (
              <label className="absolute left-3 top-3 flex min-h-11 min-w-11 items-center">
                <input type="checkbox" checked={!!selected[p.id]} onChange={() => toggleSelect(p.id)} className="h-5 w-5 accent-porter-green-500" />
              </label>
            )}
            <div className="absolute right-2 top-2 flex gap-1">
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-porter-text-muted hover:bg-porter-bg-raised hover:text-porter-text-primary"
                aria-label="Edit"
                onClick={() => setModal(p)}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-porter-text-muted hover:bg-porter-bg-raised hover:text-porter-status-cancelled"
                aria-label="Delete"
                onClick={() => setDeleteProduct(p)}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className={`pr-16 text-title text-porter-text-primary ${editMode ? "pl-8" : ""}`}>{p.name}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {!isProductListedForBot(p) && (
                <Badge kind="status" variant="cancelled" label="Hidden from bot" size="sm" />
              )}
              {stockLevelLabel(p) && (
                <Badge kind="status" variant={stockLevelVariant(p)} label={stockLevelLabel(p)!} size="sm" />
              )}
            </div>
            {(p.aliases ?? []).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {(p.aliases ?? []).slice(0, 8).map((a) => (
                  <span key={a} className="rounded-md border border-porter-bg-border bg-porter-bg-raised px-1.5 py-0.5 text-[10px] text-porter-text-muted">
                    {a}
                  </span>
                ))}
              </div>
            )}
            <p className="mt-3 font-display text-2xl tracking-wide text-porter-text-primary">
              ₹{p.price} <span className="text-sm font-sans text-porter-text-muted">/ {p.unit}</span>
            </p>
            {p.category && (
              <div className="mt-2">
                <Badge kind="plan" variant="starter" label={p.category} size="sm" />
              </div>
            )}
            <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 py-2">
              <span className="text-sm font-semibold text-porter-text-secondary">Listed in bot</span>
              <input
                type="checkbox"
                checked={isProductListedForBot(p)}
                title={!isProductListedForBot(p) ? productListingHint(p) : "Shown in WhatsApp catalog when in stock and active"}
                onChange={async (e) => {
                  const listed = e.target.checked;
                  const snapshot = {
                    in_stock: p.in_stock,
                    is_active: p.is_active !== false,
                    stock_quantity: p.stock_quantity ?? (p.in_stock ? 1 : 0),
                  };
                  const next = listed
                    ? { is_active: true, stock_quantity: Math.max(1, snapshot.stock_quantity || 1), in_stock: true }
                    : { is_active: false, stock_quantity: 0, in_stock: false };
                  setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, ...next } : x)));
                  const { error } = await supabase.from("products").update(next).eq("id", p.id);
                  if (error) {
                    setProducts((list) => list.map((x) => (x.id === p.id ? { ...x, ...snapshot } : x)));
                    toast(error.message, "error");
                  }
                }}
                className="h-6 w-11 accent-porter-green-500"
              />
            </label>
            {!isProductListedForBot(p) ? (
              <p className="mt-2 text-xs leading-snug text-porter-text-muted">{productListingHint(p)}</p>
            ) : null}
          </Card>
        ))}
      </div>
      )}

      {sortedFiltered.length === 0 && <EmptyState title="No products match" description="Try a different search or category." />}

      <InventoryLedgerPanel
        products={products}
        onStockChanged={async () => {
          const { data } = await supabase.from("products").select("*").eq("seller_id", seller.id);
          if (data) setProducts(data);
        }}
      />

      {editMode && selectedCount > 0 && (
        <div className="fixed bottom-4 left-3 right-3 z-40 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-porter-bg-border bg-porter-bg-raised p-3 shadow-modal md:left-auto md:right-6 md:min-w-[420px]">
          <span className="text-sm font-semibold text-porter-text-primary">{selectedCount} selected</span>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => setBulkCategoryOpen(true)}>
              Set category…
            </Button>
            <Button type="button" size="sm" variant="primary" onClick={() => setBulkPriceOpen(true)}>
              Set price…
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => void bulkOutOfStock()}>
              Mark out of stock
            </Button>
            <Button type="button" size="sm" variant="danger" onClick={() => setBulkDeleteOpen(true)}>
              Delete selected
            </Button>
          </div>
        </div>
      )}

      {modal && (
        <ProductModal
          seller={seller}
          product={modal === "new" ? null : modal}
          productCount={products.length}
          nextSortOrder={nextSortOrder}
          onClose={() => setModal(null)}
          onSaved={(p) => {
            if (modal === "new") setProducts((prev) => [p, ...prev]);
            else setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
            setModal(null);
            toast("Product saved", "success");
          }}
        />
      )}

      <Modal
        open={bulkCategoryOpen}
        onClose={() => setBulkCategoryOpen(false)}
        title={`Set category for ${selectedCount} products`}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setBulkCategoryOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void bulkSetCategory()}>
              Apply category
            </Button>
          </>
        }
      >
        <Input.Select
          id="bulk-cat-pre"
          label="Category preset"
          value={bulkCategoryPreset}
          onChange={(e) => setBulkCategoryPreset(e.target.value)}
        >
          {PRESET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Input.Select>
        <Input.Text
          id="bulk-cat-custom"
          className="mt-4"
          label="Custom category (optional)"
          value={bulkCategoryCustom}
          onChange={(e) => setBulkCategoryCustom(e.target.value)}
          placeholder="Overrides preset when filled"
          hint="Leave blank to use the preset above."
        />
      </Modal>

      <Modal
        open={bulkPriceOpen}
        onClose={() => setBulkPriceOpen(false)}
        title={`Set price for ${selectedCount} products`}
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setBulkPriceOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void bulkSetPrice()}>
              Apply ₹{bulkPriceInput || "—"}
            </Button>
          </>
        }
      >
        <Input.Text
          id="bulk-price"
          label="New price (₹ per unit)"
          inputVariant="number"
          value={bulkPriceInput}
          onChange={(e) => setBulkPriceInput(e.target.value)}
          min={0.01}
          step={0.01}
          placeholder="e.g. 45"
        />
        <p className="mt-2 text-xs text-porter-text-muted">Applies to every selected product. Unit (kg, piece, etc.) is unchanged.</p>
      </Modal>

      <ConfirmDialog
        open={deleteProduct != null}
        onClose={() => setDeleteProduct(null)}
        title="Delete this product?"
        description="This permanently removes it from your catalog and the WhatsApp bot."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={async () => {
          if (!deleteProduct) return;
          const p = deleteProduct;
          const prev = products;
          setProducts((x) => x.filter((y) => y.id !== p.id));
          const { error } = await supabase.from("products").delete().eq("id", p.id);
          if (error) {
            setProducts(prev);
            toast(error.message, "error");
            throw new Error(error.message);
          }
          toast("Product deleted", "success");
        }}
      />

      <Modal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        title="Delete selected products?"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={() => void bulkDelete()}>
              Delete {selectedCount}
            </Button>
          </>
        }
      >
        <p className="text-body text-porter-text-secondary">This will permanently remove the selected products from your catalog.</p>
      </Modal>
    </div>
  );
}

function ProductModal({
  seller,
  product,
  productCount,
  nextSortOrder,
  onClose,
  onSaved,
}: {
  seller: Seller;
  product: Product | null;
  productCount: number;
  /** Next `sort_order` for newly created products (Plan0 §5). */
  nextSortOrder: number;
  onClose: () => void;
  onSaved: (p: Product) => void;
}) {
  const supabase = createSupabaseBrowserClient();
  const { push: toast } = useToast();
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? "");
  const [aliasInput, setAliasInput] = useState("");
  const [aliasChips, setAliasChips] = useState<string[]>(product?.aliases ?? []);
  const [categoryMode, setCategoryMode] = useState<"preset" | "custom">(() => {
    const c = product?.category ?? "";
    if (!c) return "preset";
    return PRESET_SET.has(c.toLowerCase()) ? "preset" : "custom";
  });
  const [categoryPreset, setCategoryPreset] = useState(() => {
    const c = product?.category ?? "Other";
    return PRESET_SET.has(c.toLowerCase()) ? c : "Other";
  });
  const [categoryCustom, setCategoryCustom] = useState(() => {
    const c = product?.category ?? "";
    return PRESET_SET.has(c.toLowerCase()) ? "" : c;
  });
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [unit, setUnit] = useState(product?.unit ?? "kg");
  const [stockQty, setStockQty] = useState(String(product?.stock_quantity ?? (product?.in_stock ? 1 : 0)));
  const [activeInBot, setActiveInBot] = useState(product ? isProductListedForBot(product) : true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  function addAliasesFromInput() {
    const parts = aliasInput
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setAliasChips((prev) => Array.from(new Set([...prev, ...parts])));
    setAliasInput("");
  }

  function onAliasKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAliasesFromInput();
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast("Not signed in", "error");
      setUploading(false);
      return;
    }
    let blob: Blob = file;
    let filenameExt = "jpg";
    try {
      const img = await createImageBitmap(file);
      const maxSide = 800;
      const w = img.width;
      const h = img.height;
      const scale = Math.min(1, maxSide / Math.max(w, h));
      const cw = Math.round(w * scale);
      const ch = Math.round(h * scale);
      const canvas = document.createElement("canvas");
      canvas.width = cw;
      canvas.height = ch;
      const ctx2 = canvas.getContext("2d");
      if (ctx2) {
        ctx2.drawImage(img, 0, 0, cw, ch);
        blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not encode image"))), "image/jpeg", 0.88);
        });
        filenameExt = "jpg";
      }
      img.close();
    } catch {
      blob = file;
      filenameExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    }
    const path = `${user.id}/${crypto.randomUUID()}.${filenameExt}`;
    const { error } = await supabase.storage.from("product-images").upload(path, blob, {
      upsert: true,
      contentType: blob.type || "image/jpeg",
    });
    setUploading(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(pub.publicUrl);
    toast("Image uploaded", "success");
  }

  async function save() {
    setBusy(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      toast("Not signed in", "error");
      setBusy(false);
      return;
    }
    const { data: sellerRow } = await supabase.from("sellers").select("id, plan").eq("user_id", user.id).single();
    if (!sellerRow) {
      toast("No seller profile", "error");
      setBusy(false);
      return;
    }
    const priceNum = parseFloat(price);
    const sq = parseInt(stockQty, 10);
    if (!name.trim() || !Number.isFinite(priceNum) || priceNum <= 0) {
      toast("Name and price greater than 0 are required", "error");
      setBusy(false);
      return;
    }
    if (!Number.isFinite(sq) || sq < 0) {
      toast("Stock quantity must be zero or a positive whole number", "error");
      setBusy(false);
      return;
    }
    if (!product) {
      const gate = checkGate(seller, "products", { productCount: productCount + 1 });
      if (!gate.ok) {
        toast(gate.reason, "error");
        setBusy(false);
        return;
      }
    }
    const listed = activeInBot && sq > 0;
    const category =
      categoryMode === "custom"
        ? categoryCustom.trim() || null
        : categoryPreset === "Other"
          ? categoryCustom.trim() || "Other"
          : categoryPreset;

    const row = {
      seller_id: sellerRow.id,
      name: name.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      aliases: aliasChips,
      category,
      price: priceNum,
      unit,
      stock_quantity: listed ? Math.max(1, sq) : 0,
      is_active: listed,
      in_stock: listed,
      ...(product ? {} : { sort_order: nextSortOrder }),
    };
    if (product) {
      const { data, error } = await supabase.from("products").update(row).eq("id", product.id).select("*").single();
      setBusy(false);
      if (error) toast(error.message, "error");
      else if (data) onSaved(data as Product);
    } else {
      const { data, error } = await supabase.from("products").insert(row).select("*").single();
      setBusy(false);
      if (error) toast(error.message, "error");
      else if (data) onSaved(data as Product);
    }
  }

  return (
    <Drawer
      open
      onClose={onClose}
      title={product ? "Edit product" : "Add product"}
      className="sm:max-w-[480px]"
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" loading={busy} onClick={() => void save()}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Input.Text id="p-name" label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input.Textarea
          id="p-desc"
          label="Description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional — shown in dashboard; bot uses name and aliases"
        />
        <Input.Text
          id="p-img"
          label="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Paste a public URL, or upload below"
        />
        <div>
          <p className="mb-1.5 text-label text-porter-text-secondary">Upload to Supabase Storage</p>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            className="text-sm text-porter-text-secondary"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadImage(f);
            }}
          />
        </div>
        <div>
          <Input.Text
            id="p-alias"
            label="Aliases"
            value={aliasInput}
            onChange={(e) => setAliasInput(e.target.value)}
            onKeyDown={onAliasKeyDown}
            onBlur={() => addAliasesFromInput()}
            placeholder="e.g. bataka, aloo — comma or Enter"
          />
          {aliasChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {aliasChips.map((a) => (
                <button
                  key={a}
                  type="button"
                  className="rounded-full border border-porter-bg-border bg-porter-bg-surface px-2 py-1 text-xs text-porter-text-secondary hover:border-porter-orange-500/50"
                  onClick={() => setAliasChips((c) => c.filter((x) => x !== a))}
                >
                  {a} ×
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-label text-porter-text-secondary">Category</p>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant={categoryMode === "preset" ? "primary" : "secondary"} onClick={() => setCategoryMode("preset")}>
                Preset
              </Button>
              <Button type="button" size="sm" variant={categoryMode === "custom" ? "primary" : "secondary"} onClick={() => setCategoryMode("custom")}>
                Custom
              </Button>
            </div>
            {categoryMode === "preset" ? (
              <Input.Select id="p-cat-pre" label="Preset" value={categoryPreset} onChange={(e) => setCategoryPreset(e.target.value)}>
                {PRESET_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Input.Select>
            ) : (
              <Input.Text id="p-cat-cust" label="Category name" value={categoryCustom} onChange={(e) => setCategoryCustom(e.target.value)} />
            )}
            {categoryMode === "preset" && categoryPreset === "Other" && (
              <Input.Text id="p-cat-other" label="Other (specify)" className="mt-2" value={categoryCustom} onChange={(e) => setCategoryCustom(e.target.value)} />
            )}
          </div>
          <Input.Text id="p-price" label="Price (₹)" inputVariant="number" required value={price} onChange={(e) => setPrice(e.target.value)} min={0.01} step={0.01} />
        </div>
        <Input.Select id="p-unit" label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Input.Select>
        <Input.Text
          id="p-stock"
          label="Stock quantity"
          inputVariant="number"
          value={stockQty}
          onChange={(e) => setStockQty(e.target.value)}
          min={0}
          step={1}
          hint="0 = out of stock. Listed in bot requires quantity ≥ 1."
        />
        <label className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 py-2">
          <span className="text-sm font-semibold text-porter-text-secondary">Listed in WhatsApp bot</span>
          <input
            type="checkbox"
            checked={activeInBot}
            onChange={(e) => setActiveInBot(e.target.checked)}
            className="h-6 w-11 accent-porter-green-500"
          />
        </label>
        {seller.plan === "starter" && (
          <p className="text-xs text-porter-text-muted">Starter plan: up to 50 products. Upgrade for unlimited.</p>
        )}
      </div>
    </Drawer>
  );
}
