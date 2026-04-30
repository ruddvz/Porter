import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

const ctaClass =
  "mt-8 flex min-h-12 w-full items-center justify-center rounded-xl bg-porter-green-500 text-base font-semibold text-porter-bg-base shadow-card transition-colors hover:bg-porter-green-600";

export default function MarketingPricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="font-display text-4xl tracking-wide text-porter-text-primary md:text-5xl">Seedha pricing. Koi hidden charges nahi.</h2>
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        <Card padding="lg">
          <p className="text-label text-porter-text-muted">Starter</p>
          <p className="mt-2 font-display text-5xl text-porter-text-primary">₹999</p>
          <p className="text-body text-porter-text-secondary">/ month</p>
          <ul className="mt-6 space-y-2 text-body text-porter-text-secondary">
            <li>1 WhatsApp number</li>
            <li>Up to 500 orders / month</li>
            <li>Live dashboard</li>
            <li>AI order parsing</li>
            <li>COD + Online payments</li>
          </ul>
          <Link href="/auth/signup" className={ctaClass}>
            Start Free 14-Day Trial
          </Link>
        </Card>
        <Card padding="lg" className="relative border-porter-green-500/50 shadow-glow">
          <div className="absolute right-4 top-4">
            <Badge kind="status" variant="paid" label="MOST POPULAR" size="sm" />
          </div>
          <p className="text-label text-porter-text-muted">Growth</p>
          <p className="mt-2 font-display text-5xl text-porter-green-400">₹1,999</p>
          <p className="text-body text-porter-text-secondary">/ month</p>
          <ul className="mt-6 space-y-2 text-body text-porter-text-secondary">
            <li>Everything in Starter</li>
            <li>Unlimited orders</li>
            <li>Order history + CSV export</li>
            <li>Abandoned order nudges</li>
            <li>Priority support</li>
          </ul>
          <Link href="/auth/signup" className={ctaClass}>
            Start Free 14-Day Trial
          </Link>
        </Card>
      </div>
      <p className="mt-8 text-center text-sm text-porter-text-muted">No contract. Cancel anytime. Setup takes 15 minutes.</p>
    </section>
  );
}
