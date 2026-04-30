import { MessageSquareWarning, PhoneOff, Wallet } from "lucide-react";
import { Card } from "@/components/ui/Card";

const items = [
  {
    icon: MessageSquareWarning,
    title: "Customer called while you were packing — half the list forgotten.",
  },
  {
    icon: PhoneOff,
    title: "WhatsApp messages stack up — seen two hours later.",
  },
  {
    icon: Wallet,
    title: "No advance payment — customer cancels at the door.",
  },
];

export function MarketingPainPoints() {
  return (
    <section id="pain" className="border-t border-porter-bg-border py-space-12 sm:py-space-16">
      <div className="mx-auto max-w-6xl px-space-4 sm:px-space-6">
        <h2 className="text-display text-porter-text-primary md:text-[56px]">
          KITLA ORDERS MISS THAY CHHE?
        </h2>
        <p className="mt-space-2 max-w-2xl text-base text-porter-text-secondary">
          How many orders are you losing every week?
        </p>
        <div className="mt-space-10 grid gap-space-4 md:grid-cols-3">
          {items.map((it) => (
            <Card key={it.title} variant="default" padding="lg" className="border-l-4 border-l-porter-orange-500">
              <it.icon className="mb-space-3 h-8 w-8 text-porter-orange-500" aria-hidden />
              <p className="text-body text-porter-text-primary">{it.title}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
