import type { PublicStore } from "@/components/storefront/types";
import { SearchField } from "@/components/ui/SearchField";
import { Package } from "lucide-react";

export function StoreHeader({
  store,
  search,
  onSearchChange,
}: {
  store: PublicStore;
  search: string;
  onSearchChange: (value: string) => void;
}) {
  const fulfillment =
    store.pickup_enabled && store.delivery_enabled
      ? "Pickup & delivery"
      : store.delivery_enabled
        ? "Delivery"
        : store.pickup_enabled
          ? "Pickup"
          : "Orders";

  const minOrder = store.min_order_amount != null ? Math.round(Number(store.min_order_amount)) : null;
  const deliveryFee = store.delivery_fee != null ? Math.round(Number(store.delivery_fee)) : null;

  return (
    <header className="safe-top border-b border-porter-bg-border bg-gradient-to-br from-porter-bg-surface to-[var(--po-bg-warm)] px-4 py-5 shadow-card">
      <div className="flex items-start gap-3">
        {store.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={store.logo_url}
            alt=""
            className="h-12 w-12 shrink-0 rounded-[var(--po-radius-md)] object-cover ring-1 ring-porter-bg-border"
          />
        ) : (
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--po-radius-md)] bg-[var(--po-primary-soft)] text-lg font-bold text-porter-green-600">
            {store.store_name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-porter-text-primary">{store.store_name}</h1>
          <p className="text-sm text-porter-text-muted">
            {store.city ?? "Local store"} · {fulfillment}
          </p>
          {store.store_description ? (
            <p className="mt-1 line-clamp-2 text-sm text-porter-text-secondary">{store.store_description}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-[var(--po-radius-pill)] border border-porter-bg-border bg-porter-bg-surface px-2.5 py-1 text-xs font-semibold text-porter-text-secondary">
              <Package className="h-3.5 w-3.5" aria-hidden />
              {fulfillment}
            </span>
            {minOrder != null && minOrder > 0 ? (
              <span className="rounded-[var(--po-radius-pill)] border border-porter-bg-border bg-porter-bg-surface px-2.5 py-1 text-xs font-semibold text-porter-text-secondary">
                Min order ₹{minOrder.toLocaleString("en-IN")}
              </span>
            ) : null}
            {deliveryFee != null && deliveryFee > 0 ? (
              <span className="rounded-[var(--po-radius-pill)] border border-porter-bg-border bg-porter-bg-surface px-2.5 py-1 text-xs font-semibold text-porter-text-secondary">
                Delivery ₹{deliveryFee.toLocaleString("en-IN")}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-4">
        <SearchField value={search} onChange={onSearchChange} placeholder="Search products" aria-label="Search products" />
      </div>
    </header>
  );
}
