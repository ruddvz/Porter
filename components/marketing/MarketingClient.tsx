import MarketingDemoLarge from "@/components/marketing/MarketingDemoLarge";
import MarketingFaq from "@/components/marketing/MarketingFaq";
import MarketingFeatures from "@/components/marketing/MarketingFeatures";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHero from "@/components/marketing/MarketingHero";
import MarketingHow from "@/components/marketing/MarketingHow";
import MarketingNav from "@/components/marketing/MarketingNav";
import MarketingPain from "@/components/marketing/MarketingPain";
import MarketingPricing from "@/components/marketing/MarketingPricing";

/** Porter marketing landing — design system, local copy, CSS-driven WhatsApp demo. */
export default function MarketingClient() {
  return (
    <div className="min-h-screen bg-porter-bg-base text-porter-text-primary">
      <MarketingNav />
      <MarketingHero />
      <MarketingPain />
      <MarketingHow />
      <MarketingDemoLarge />
      <MarketingFeatures />
      <MarketingPricing />
      <MarketingFaq />
      <MarketingFooter />
    </div>
  );
}
