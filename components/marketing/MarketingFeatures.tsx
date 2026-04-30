import { MessageCircle, CreditCard, Package, LayoutGrid, Link2, Bell } from "lucide-react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: MessageCircle,
    title: "Gujarati + Hindi + English",
    body: "Customers type naturally. Porter understands all three automatically.",
  },
  {
    icon: Package,
    title: "AI order parser",
    body: "“5 kilo bataka” becomes a line item in one second — no manual entry.",
  },
  {
    icon: CreditCard,
    title: "Cash on delivery",
    body: "Customer picks online or COD. The bot collects choice and tracks payment state.",
  },
  {
    icon: LayoutGrid,
    title: "Live order dashboard",
    body: "Kanban board with real-time updates — see pending, out for delivery, delivered.",
  },
  {
    icon: Link2,
    title: "Instant payment links",
    body: "Razorpay link lands in the same WhatsApp chat — no extra apps for your buyer.",
  },
  {
    icon: Bell,
    title: "Abandoned order nudges",
    body: "If someone goes quiet mid-order, Porter can follow up (Growth plan).",
  },
];

export function MarketingFeatures() {
  return (
    <section id="features" className="border-t border-porter-bg-border py-space-12 sm:py-space-16">
      <div className="mx-auto max-w-6xl px-space-4 sm:px-space-6">
        <h2 className="text-display text-porter-text-primary md:text-[52px]">Built for your counter</h2>
        <p className="mt-space-2 max-w-2xl text-body text-porter-text-secondary">
          Six things shop owners asked for first — nothing extra.
        </p>
        <div className="mt-space-10 grid gap-space-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} variant="raised" padding="lg" className="border-porter-bg-border">
              <f.icon className="mb-space-3 h-8 w-8 text-porter-green-500" aria-hidden />
              <h3 className="text-title text-porter-text-primary">{f.title}</h3>
              <p className="mt-space-2 text-body text-porter-text-secondary">{f.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
