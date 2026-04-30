import { MarketingNav } from "@/components/marketing/MarketingNav";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingPainPoints } from "@/components/marketing/MarketingPainPoints";
import { MarketingHowItWorks } from "@/components/marketing/MarketingHowItWorks";
import { MarketingDemoSection } from "@/components/marketing/MarketingDemoSection";
import { MarketingFeatures } from "@/components/marketing/MarketingFeatures";
import { MarketingPricing } from "@/components/marketing/MarketingPricing";
import { MarketingFaq } from "@/components/marketing/MarketingFaq";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { Button } from "@/components/ui/Button";

export default function MarketingHomePage() {
  return (
    <div className="min-h-screen bg-porter-bg-base">
      <MarketingNav />
      <main>
        <MarketingHero />
        <MarketingPainPoints />
        <MarketingHowItWorks />
        <MarketingDemoSection />
        <MarketingFeatures />
        <MarketingPricing />
        <MarketingFaq />
      </main>
      <MarketingFooter />
      <div className="fixed bottom-4 right-4 z-40 flex flex-col gap-space-2 sm:bottom-6 sm:right-6">
        <Button href="/dashboard/" variant="secondary" size="sm" className="shadow-raised">
          Shop dashboard
        </Button>
        <Button href="/design-system/" variant="ghost" size="sm" className="border border-porter-bg-border bg-porter-bg-surface/90 shadow-card">
          Design system
        </Button>
      </div>
    </div>
  );
}
