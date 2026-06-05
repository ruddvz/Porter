export function CartBar({
  itemCount,
  total,
  onOpenCart,
}: {
  itemCount: number;
  total: number;
  onOpenCart: () => void;
}) {
  if (itemCount <= 0) return null;

  return (
    <div className="fixed inset-x-4 bottom-[calc(env(safe-area-inset-bottom)+12px)] z-20">
      <button
        type="button"
        className="flex min-h-14 w-full items-center justify-between rounded-[var(--po-radius-pill)] border border-porter-bg-border bg-porter-bg-surface/95 px-5 shadow-[var(--po-shadow-floating)] backdrop-blur"
        onClick={onOpenCart}
      >
        <span className="text-sm font-semibold text-porter-text-primary">
          {itemCount} item{itemCount === 1 ? "" : "s"} · ₹{Math.round(total).toLocaleString("en-IN")}
        </span>
        <span className="rounded-[var(--po-radius-pill)] bg-porter-green-500 px-4 py-2 text-sm font-bold text-white">
          View cart
        </span>
      </button>
    </div>
  );
}
