"use client";

import { Button } from "@/components/ui/Button";
import { WhatsAppDemo } from "@/components/marketing/WhatsAppDemo";
import { ChevronDown } from "lucide-react";

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden pt-space-8 pb-space-12 sm:pt-space-12 sm:pb-space-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(37,211,102,0.12),transparent)]" />
      <div className="relative mx-auto grid max-w-6xl gap-space-10 px-space-4 lg:grid-cols-2 lg:items-center sm:px-space-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-porter-orange-500">
            ₹0 setup · WhatsApp-first · India-ready
          </p>
          <h1 className="mt-space-4 font-display text-[clamp(2.5rem,8vw,4.5rem)] leading-[0.95] tracking-wide text-porter-text-primary">
            <span className="block">AAPNI SHOP</span>
            <span className="block text-porter-green-500">WHATSAPP PE.</span>
            <span className="block">ORDERS AUTOMATICALLY.</span>
          </h1>
          <p className="mt-space-6 max-w-xl text-base leading-relaxed text-porter-text-secondary">
            Customer types their order in Gujarati, Hindi or English. Porter confirms it, gets the address, sends a
            payment link. You just pack it.
          </p>
          <div className="mt-space-8 flex flex-col gap-space-3 sm:max-w-md">
            <Button href="/auth/signup/" variant="primary" size="lg" className="w-full sm:w-auto">
              Start free trial
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              className="w-full border border-porter-bg-border sm:w-auto"
              onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}
            >
              See how it works <ChevronDown className="ml-1 inline h-4 w-4" aria-hidden />
            </Button>
          </div>
          <div className="mt-space-10 flex items-center gap-space-4">
            <div className="flex -space-x-2">
              {["KJ", "RS", "AM"].map((x) => (
                <div
                  key={x}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-porter-bg-base bg-porter-bg-raised text-xs font-bold text-porter-green-400"
                >
                  {x}
                </div>
              ))}
            </div>
            <p className="text-sm text-porter-text-muted">50+ shops in Vadodara &amp; Surat (placeholder)</p>
          </div>
        </div>
        <WhatsAppDemo className="mx-auto w-full max-w-md lg:max-w-none" />
      </div>
    </section>
  );
}
