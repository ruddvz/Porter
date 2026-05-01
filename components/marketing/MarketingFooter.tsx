import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="border-t border-porter-bg-border bg-porter-bg-base pb-10 pt-12">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-3">
        <div>
          <p className="font-display text-3xl text-porter-green-500">PORTER</p>
          <p className="mt-3 text-body text-porter-text-secondary">WhatsApp-first orders for local India.</p>
          <p className="mt-2 text-sm text-porter-text-muted">Made in Gujarat.</p>
        </div>
        <div className="grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-label text-porter-text-muted">Product</p>
            <ul className="mt-3 space-y-2 text-porter-text-secondary">
              <li>
                <a href="#how" className="hover:text-porter-green-400">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-porter-green-400">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-porter-green-400">
                  Demo
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-label text-porter-text-muted">Company</p>
            <ul className="mt-3 space-y-2 text-porter-text-secondary">
              <li>
                <span className="opacity-60">About</span>
              </li>
              <li>
                <span className="opacity-60">Contact</span>
              </li>
            </ul>
          </div>
        </div>
        <Card padding="lg" variant="raised">
          <p className="text-title text-porter-text-primary">Start today</p>
          <p className="mt-2 text-body text-porter-text-secondary">14-day trial. No card on file for signup.</p>
          <Link
            href="/auth/signup"
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-xl bg-porter-green-500 text-base font-semibold text-porter-bg-base shadow-card hover:bg-porter-green-600"
          >
            Start Free Trial
          </Link>
        </Card>
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-porter-bg-border px-4 pt-6 text-xs text-porter-text-muted">
        <span>© 2026 Porter</span>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:text-porter-text-secondary">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-porter-text-secondary">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
}
