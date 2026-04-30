import { Card } from "@/components/ui/Card";
import { Bot, CreditCard, Globe2, LayoutDashboard, Link2, RefreshCw } from "lucide-react";

const items = [
  { icon: Globe2, title: "Gujarati + Hindi + English", body: "Customers type the way they talk. Porter still lines up clean items on your dashboard." },
  { icon: Bot, title: "AI order parser", body: "'5 kilo bataka' becomes a line item in a second — less back-and-forth on busy evenings." },
  { icon: CreditCard, title: "Cash on Delivery", body: "Online or COD — the bot collects the choice before you print the bag." },
  { icon: LayoutDashboard, title: "Live order dashboard", body: "Kanban board with realtime updates — see pending orders before they go cold." },
  { icon: Link2, title: "Instant payment links", body: "Razorpay link in the same chat thread — fewer 'UPI kidhar mokvu?' confusions." },
  { icon: RefreshCw, title: "Abandoned order nudges", body: "If someone ghosts mid-order, Porter can nudge them back — more completed carts." },
];

export default function MarketingFeatures() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="font-display text-4xl tracking-wide text-porter-text-primary md:text-5xl">Built for real shops</h2>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((f) => (
          <Card key={f.title} padding="lg" variant="default" className="border-porter-bg-border">
            <f.icon className="h-8 w-8 text-porter-green-400" />
            <h3 className="mt-4 text-title text-porter-text-primary">{f.title}</h3>
            <p className="mt-2 text-body text-porter-text-secondary">{f.body}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
