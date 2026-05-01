"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Do my customers need to install any app?",
    a: "No. They use normal WhatsApp — the same app they already open fifty times a day.",
  },
  {
    q: "Can the bot understand Gujarati?",
    a: "Yes — Gujarati, Hindi, and English, often mixed in one message. That is how real orders sound.",
  },
  {
    q: "How hard is it to add my products?",
    a: "About ten minutes in the Porter dashboard — name, price, aliases for local words, done.",
  },
  {
    q: "What if I already have WhatsApp Business?",
    a: "You connect your existing WhatsApp Business number to Porter — customers keep texting the same shop.",
  },
  {
    q: "Is my customer's data safe?",
    a: "Data is stored in India-region infrastructure and is not sold to advertisers. It is for running your shop, not for ads.",
  },
];

export default function MarketingFaq() {
  const [open, setOpen] = useState(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h2 className="font-display text-4xl tracking-wide text-porter-text-primary">FAQ</h2>
      <div className="mt-8 space-y-2">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="rounded-xl border border-porter-bg-border bg-porter-bg-surface">
              <button
                type="button"
                className="flex min-h-12 w-full items-center justify-between px-4 py-3 text-left text-title text-porter-text-primary"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
              >
                {f.q}
                <span className="text-porter-text-muted">{isOpen ? "−" : "+"}</span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-base ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <p className="border-t border-porter-bg-border px-4 py-3 text-body text-porter-text-secondary">{f.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
