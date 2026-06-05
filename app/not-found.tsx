import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen flex-col items-center justify-center bg-porter-bg-base px-6 py-12 text-center safe-top safe-bottom">
      <div className="max-w-md space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-porter-green-600">404</p>
        <h1 className="text-display text-porter-text-primary">Page not found</h1>
        <p className="text-body text-porter-text-secondary">
          This Porter link may be old or unavailable. Check the URL or return to your dashboard.
        </p>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--po-radius-md)] bg-porter-green-500 px-6 text-[15px] font-semibold text-white shadow-card hover:bg-porter-green-600"
          >
            Go to dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--po-radius-md)] border border-porter-bg-border bg-porter-bg-surface px-6 text-[15px] font-semibold text-porter-text-primary hover:bg-porter-bg-raised"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
