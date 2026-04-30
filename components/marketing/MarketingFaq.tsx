"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Do my customers need to install any app?",
    a: "No. They use normal WhatsApp on their phone — the same app they already have.",
  },
  {
    q: "Can the bot understand Gujarati?",
    a: "Yes. Gujarati, Hindi, and English — often mixed in one message — are all supported.",
  },
  {
    q: "How hard is it to add my products?",
    a: "About ten minutes in the Porter dashboard: name, price, unit, and a few local aliases so the AI matches what people type.",
  },
  {
    q: "What if I already have WhatsApp Business?",
    a: "You connect your existing number. Porter works alongside your current setup.",
  },
  {
    q: "Is my customer's data safe?",
    a: "Data stays in India-region infrastructure. We do not sell customer lists to third parties.",
  },
];

export function MarketingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="border-t border-porter-bg-border py-space-12 sm:py-space-16">
      <div className="mx-auto max-w-3xl px-space-4 sm:px-space-6">
        <h2 className="text-display text-porter-text-primary md:text-[48px]">FAQ</h2>
        <div className="mt-space-8 divide-y divide-porter-bg-border rounded-xl border border-porter-bg-border bg-porter-bg-surface">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  className="flex w-full min-h-12 items-center justify-between gap-space-4 px-space-4 py-space-4 text-left sm:px-space-6"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span className="text-base font-semibold text-porter-text-primary">{item.q}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-porter-text-muted transition-transform duration-300",
                      isOpen && "rotate-180"
                    )}
                    aria-hidden
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-space-4 pb-space-4 text-body text-porter-text-secondary sm:px-space-6 sm:pb-space-6">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
