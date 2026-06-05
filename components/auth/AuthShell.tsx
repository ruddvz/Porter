import type { ReactNode } from "react";

type AuthShellProps = {
  children: ReactNode;
  subtitle: string;
};

/** Light iOS-friendly seller auth layout. */
export function AuthShell({ children, subtitle }: AuthShellProps) {
  return (
    <main id="main-content" className="min-h-screen bg-porter-bg-base text-porter-text-primary">
      <div className="lg:grid lg:min-h-screen lg:grid-cols-5">
        <div className="relative flex flex-col justify-center overflow-hidden border-b border-porter-bg-border bg-[var(--po-surface-green)] px-6 py-10 safe-top lg:col-span-2 lg:border-b-0 lg:border-r lg:px-10 lg:py-16">
          <div className="relative z-[1] space-y-4">
            <p className="text-display text-porter-green-500">Porter</p>
            <p className="text-title text-porter-text-primary">{subtitle}</p>
            <p className="max-w-sm text-body text-porter-text-secondary">
              Run your shop from your phone — WhatsApp orders, stock, payments, and delivery in one calm place.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {["Orders", "WhatsApp", "UPI & COD"].map((pill) => (
                <span
                  key={pill}
                  className="rounded-pill border border-porter-green-500/20 bg-porter-bg-surface px-3 py-1.5 text-xs font-semibold text-porter-green-600"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center bg-porter-bg-surface px-4 py-10 sm:px-8 lg:col-span-3 lg:px-16 lg:py-12">
          {children}
        </div>
      </div>
    </main>
  );
}
