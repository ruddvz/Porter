import type { PublicProduct } from "@/components/storefront/types";
import { stockDisplayLabel } from "@/lib/inventory";
import { Minus, Plus } from "lucide-react";

export function ProductCard({
  product,
  qty,
  onAdd,
  onSetQty,
}: {
  product: PublicProduct;
  qty: number;
  onAdd: () => void;
  onSetQty: (qty: number) => void;
}) {
  const out = !product.in_stock;

  return (
    <li className="flex gap-3 rounded-[var(--po-radius-lg)] border border-porter-bg-border bg-porter-bg-surface p-3 shadow-card">
      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={product.image_url}
          alt=""
          className="h-[72px] w-[72px] shrink-0 rounded-[var(--po-radius-md)] object-cover bg-porter-bg-raised"
        />
      ) : (
        <span className="inline-flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[var(--po-radius-md)] bg-[var(--po-primary-soft)] text-xl font-bold text-porter-green-600">
          {product.name.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-semibold text-porter-text-primary">{product.name}</p>
        <p className="text-xs text-porter-text-muted">{product.unit}</p>
        <p className="mt-1 text-base font-bold tabular-nums text-porter-green-600">
          ₹{Math.round(Number(product.price)).toLocaleString("en-IN")}
        </p>
        <p className={`text-xs ${out ? "text-porter-orange-500 font-semibold" : "text-porter-text-muted"}`}>
          {out ? "Out of stock" : stockDisplayLabel(product.stock_quantity ?? 0)}
        </p>
        <div className="mt-2">
          {qty > 0 ? (
            <div className="inline-flex items-center rounded-[var(--po-radius-pill)] border border-porter-bg-border bg-porter-bg-raised">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center text-porter-text-primary"
                aria-label={`Decrease ${product.name}`}
                onClick={() => onSetQty(qty - 1)}
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[2rem] text-center text-sm font-bold tabular-nums">{qty}</span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center text-porter-text-primary disabled:opacity-40"
                aria-label={`Increase ${product.name}`}
                disabled={out}
                onClick={() => onSetQty(qty + 1)}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="min-h-10 rounded-[var(--po-radius-pill)] bg-porter-green-500 px-5 text-sm font-bold text-white disabled:opacity-50"
              disabled={out}
              onClick={onAdd}
            >
              Add
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
