import { Button } from "@/components/ui/Button";

export function StoreEmptyState({
  variant,
  onClearSearch,
}: {
  variant: "no-products" | "no-search";
  onClearSearch?: () => void;
}) {
  if (variant === "no-search") {
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <p className="text-lg font-semibold text-porter-text-primary">No matches for your search</p>
        <p className="mt-2 text-sm text-porter-text-muted">Try a different search term or category.</p>
        {onClearSearch ? (
          <Button type="button" variant="secondary" className="mt-4" onClick={onClearSearch}>
            Clear search
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[var(--po-radius-xl)] bg-[var(--po-accent-soft)] text-2xl" aria-hidden>
        🛒
      </div>
      <p className="mt-4 text-lg font-semibold text-porter-text-primary">No products available yet</p>
      <p className="mt-2 max-w-sm text-sm text-porter-text-muted">
        This store is getting set up. Please check again later or contact the seller on WhatsApp.
      </p>
    </div>
  );
}
