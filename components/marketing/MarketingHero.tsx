import { cn } from "@/lib/cn";
import Link from "next/link";
import MarketingWhatsAppMock from "./MarketingWhatsAppMock";

const btnPrimary =
  "inline-flex min-h-12 items-center justify-center rounded-xl bg-porter-green-500 px-6 text-base font-semibold text-porter-bg-base shadow-card transition-[transform,opacity] hover:bg-porter-green-600 active:scale-[0.98]";
const btnGhost =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-porter-bg-border px-6 text-base font-semibold text-porter-text-secondary transition-colors hover:bg-porter-bg-raised hover:text-porter-text-primary";

export default function MarketingHero() {
  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-8 md:grid-cols-2 md:items-center md:pt-14">
      <div>
        <p className="text-sm font-semibold text-porter-orange-500">₹0 setup · WhatsApp-first · India-ready</p>
        <h1 className="mt-4 font-display text-[clamp(2.5rem,10vw,4.5rem)] leading-[0.95] tracking-wide text-porter-text-primary">
          AAPNI SHOP
          <br />
          WHATSAPP PE.
          <br />
          <span className="text-porter-green-500">ORDERS AUTOMATICALLY.</span>
        </h1>
        <p className="mt-6 max-w-lg text-base leading-relaxed text-porter-text-secondary">
          Customer types their order in Gujarati, Hindi or English. Porter confirms it, gets the address, sends a payment link. You just pack it.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link href="/auth/signup" className={cn(btnPrimary, "w-full text-center sm:w-auto")}>
            Start Free Trial
          </Link>
          <a href="#how" className={cn(btnGhost, "w-full text-center sm:w-auto")}>
            See How It Works ↓
          </a>
        </div>
        <div className="mt-8 flex items-center gap-3">
          <div className="flex -space-x-2">
            {["PS", "RK", "MJ"].map((x) => (
              <span
                key={x}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-porter-bg-base bg-porter-bg-raised text-xs font-bold text-porter-text-secondary"
              >
                {x}
              </span>
            ))}
          </div>
          <p className="text-sm text-porter-text-muted">50+ shops in Vadodara & Surat</p>
        </div>
      </div>
      <MarketingWhatsAppMock />
    </section>
  );
}
