import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function MarketingPricing() {
  return (
    <section id="pricing" className="border-t border-porter-bg-border py-space-12 sm:py-space-16">
      <div className="mx-auto max-w-6xl px-space-4 sm:px-space-6">
        <h2 className="text-display text-porter-text-primary md:text-[52px]">Seedha pricing</h2>
        <p className="mt-space-2 text-lg text-porter-text-secondary">Koi hidden charges nahi.</p>
        <div className="mt-space-10 grid gap-space-6 md:grid-cols-2">
          <Card variant="default" padding="lg" className="relative">
            <p className="text-label text-porter-text-muted">Starter</p>
            <p className="mt-space-2 font-display text-5xl text-porter-green-400">
              ₹999<span className="font-sans text-lg text-porter-text-muted">/month</span>
            </p>
            <ul className="mt-space-6 space-y-space-2 text-body text-porter-text-secondary">
              <li>1 WhatsApp number</li>
              <li>Up to 500 orders / month</li>
              <li>Live dashboard</li>
              <li>AI order parsing</li>
              <li>COD + online payments</li>
            </ul>
            <Button href="/auth/signup/" variant="primary" className="mt-space-8 w-full" size="lg">
              Start free 14-day trial
            </Button>
          </Card>
          <Card
            variant="raised"
            padding="lg"
            className="relative border-2 border-porter-green-500/40 shadow-glow"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge variant="plan" plan="growth" label="MOST POPULAR" />
            </div>
            <p className="text-label text-porter-text-muted">Growth</p>
            <p className="mt-space-2 font-display text-5xl text-porter-green-400">
              ₹1,999<span className="font-sans text-lg text-porter-text-muted">/month</span>
            </p>
            <ul className="mt-space-6 space-y-space-2 text-body text-porter-text-secondary">
              <li>Everything in Starter</li>
              <li>Unlimited orders</li>
              <li>Order history + CSV export</li>
              <li>Abandoned order nudges</li>
              <li>Priority support</li>
            </ul>
            <Button href="/auth/signup/" variant="primary" className="mt-space-8 w-full" size="lg">
              Start free 14-day trial
            </Button>
          </Card>
        </div>
        <p className="mt-space-8 text-center text-sm text-porter-text-muted">
          No contract. Cancel anytime. Setup takes about 15 minutes with your product list.
        </p>
      </div>
    </section>
  );
}
