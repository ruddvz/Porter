import { Card } from "@/components/ui/Card";
import { MessageSquareOff, PhoneOff, Wallet } from "lucide-react";

const items = [
  {
    icon: PhoneOff,
    title: "Customer called while you were packing — half the list forgotten.",
  },
  {
    icon: MessageSquareOff,
    title: "WhatsApp messages stack up — seen 2 hours later.",
  },
  {
    icon: Wallet,
    title: "No advance payment — customer cancels at the door.",
  },
];

export default function MarketingPain() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-tight tracking-wide text-porter-text-primary">
        KITLA ORDERS MISS THAY CHHE?
      </h2>
      <p className="mt-2 text-body text-porter-orange-500">How many orders are you losing?</p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((it) => (
          <Card key={it.title} padding="lg" className="border-l-4 border-l-porter-orange-500">
            <it.icon className="h-8 w-8 text-porter-orange-500" aria-hidden />
            <p className="mt-4 text-body text-porter-text-secondary">{it.title}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
