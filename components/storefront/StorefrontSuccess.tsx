export function StorefrontSuccess({
  trackUrl,
  onContinue,
}: {
  trackUrl: string;
  onContinue: () => void;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-porter-bg-base px-6 py-12 text-center safe-bottom">
      <div className="max-w-sm space-y-4 rounded-[var(--po-radius-xl)] border border-porter-bg-border bg-porter-bg-surface p-8 shadow-card">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--po-primary-soft)] text-2xl" aria-hidden>
          ✓
        </div>
        <h1 className="text-2xl font-bold text-porter-green-600">Order placed</h1>
        <p className="text-sm text-porter-text-secondary">We sent your order to the store.</p>
        {trackUrl ? (
          <a
            href={trackUrl}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-[var(--po-radius-pill)] bg-porter-green-500 px-6 font-semibold text-white shadow-card"
          >
            Track order
          </a>
        ) : null}
        <button
          type="button"
          className="min-h-11 w-full text-sm font-semibold text-porter-green-600"
          onClick={onContinue}
        >
          Continue shopping
        </button>
      </div>
    </main>
  );
}
