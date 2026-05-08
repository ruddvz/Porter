import type { ReactNode } from "react";

const GRID_BG =
  "linear-gradient(rgba(37,211,102,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,211,102,0.06) 1px, transparent 1px)";

type AuthShellProps = {
  /** Right column: form + links */
  children: ReactNode;
  /** e.g. "Seller login" */
  subtitle: string;
};

/**
 * Plan0 §2 — split brand (left) + form (right) on large screens; stacked on mobile.
 * India-first copy (no Arabic / RTL).
 */
export function AuthShell({ children, subtitle }: AuthShellProps) {
  return (
    <main id="main-content" className="min-h-screen bg-porter-bg-base text-porter-text-primary">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-5">
        <div className="relative flex flex-col justify-center overflow-hidden border-b border-porter-bg-border px-6 py-10 lg:col-span-2 lg:border-b-0 lg:border-r lg:px-10 lg:py-16">
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{ backgroundImage: GRID_BG, backgroundSize: "24px 24px" }}
            aria-hidden
          />
          <div className="relative z-[1] space-y-4">
            <p className="font-display text-5xl tracking-wide text-porter-green-500">PORTER</p>
            <p className="text-body text-porter-text-secondary">{subtitle}</p>
            <p className="max-w-sm text-sm leading-relaxed text-porter-text-muted">
              Your store. Every WhatsApp. Zero friction — inventory, orders, and Razorpay for kirana and dark stores in
              India.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Inventory", "WhatsApp orders", "UPI & Razorpay"].map((pill) => (
                <span
                  key={pill}
                  className="rounded-md border border-porter-green-500/25 bg-porter-green-500/10 px-2.5 py-1 text-xs font-semibold text-porter-green-400"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center px-4 py-10 sm:px-8 lg:col-span-3 lg:px-16 lg:py-12">{children}</div>
      </div>
    </main>
  );
}
