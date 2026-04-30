import { Button } from "@/components/ui/Button";
import { WhatsAppDemo } from "@/components/marketing/WhatsAppDemo";

export function MarketingDemoSection() {
  return (
    <section id="demo" className="border-t border-porter-bg-border bg-porter-bg-surface py-space-12 sm:py-space-20">
      <div className="mx-auto max-w-6xl px-space-4 sm:px-space-6">
        <h2 className="text-center text-display text-porter-text-primary md:text-[52px]">
          This is exactly what your customers will see
        </h2>
        <p className="mx-auto mt-space-3 max-w-2xl text-center text-body text-porter-text-secondary">
          Same flow as the hero — larger preview for shop owners who want one more look before they sign up.
        </p>
        <div className="mt-space-10 flex justify-center">
          <WhatsAppDemo large className="w-full max-w-lg" />
        </div>
        <p className="mt-space-8 text-center text-lg font-medium text-porter-text-primary">
          No app. No signup for your buyer. Just WhatsApp.
        </p>
        <div className="mt-space-8 flex justify-center">
          <Button href="/auth/signup/" variant="primary" size="lg">
            Start free 14-day trial
          </Button>
        </div>
      </div>
    </section>
  );
}
