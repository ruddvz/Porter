"use client";

import { Button } from "@/components/ui/Button";

export function MarketingFooter() {
  return (
    <footer className="border-t border-porter-bg-border bg-porter-bg-surface py-space-12">
      <div className="mx-auto grid max-w-6xl gap-space-10 px-space-4 sm:grid-cols-3 sm:px-space-6">
        <div>
          <p className="font-display text-2xl tracking-wide text-porter-green-500">PORTER</p>
          <p className="mt-space-3 text-body text-porter-text-secondary">
            WhatsApp-first orders for local India.
          </p>
          <p className="mt-space-2 text-sm text-porter-text-muted">Made in Gujarat.</p>
        </div>
        <div>
          <p className="text-label text-porter-text-muted">Product</p>
          <ul className="mt-space-3 space-y-space-2 text-sm text-porter-text-secondary">
            <li>
              <button
                type="button"
                className="hover:text-porter-green-400"
                onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
              >
                How it works
              </button>
            </li>
            <li>
              <button
                type="button"
                className="hover:text-porter-green-400"
                onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
              >
                Pricing
              </button>
            </li>
            <li>
              <button
                type="button"
                className="hover:text-porter-green-400"
                onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
              >
                Demo
              </button>
            </li>
          </ul>
          <p className="mt-space-6 text-label text-porter-text-muted">Company</p>
          <ul className="mt-space-2 space-y-space-2 text-sm text-porter-text-secondary">
            <li>
              <span className="text-porter-text-muted">About — coming soon</span>
            </li>
            <li>
              <span className="text-porter-text-muted">Contact — coming soon</span>
            </li>
          </ul>
        </div>
        <div>
          <div className="rounded-xl border border-porter-bg-border bg-porter-bg-raised p-space-6 shadow-raised">
            <p className="text-title text-porter-text-primary">Start today</p>
            <p className="mt-space-2 text-sm text-porter-text-secondary">
              Free trial. No card on file for the first two weeks.
            </p>
            <Button href="/auth/signup/" variant="primary" className="mt-space-4 w-full" size="md">
              Get Porter
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-space-10 max-w-6xl border-t border-porter-bg-border px-space-4 pt-space-6 text-center text-xs text-porter-text-muted sm:px-space-6">
        <p>© 2026 Porter · Privacy Policy · Terms of Service</p>
      </div>
    </footer>
  );
}
