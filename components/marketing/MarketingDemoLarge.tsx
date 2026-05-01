import MarketingWhatsAppMock from "./MarketingWhatsAppMock";

export default function MarketingDemoLarge() {
  return (
    <section id="demo" className="border-y border-porter-bg-border bg-porter-bg-surface py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-display text-4xl tracking-wide text-porter-text-primary md:text-5xl">
          This is exactly what your customers will see.
        </h2>
        <div className="mx-auto mt-10 max-w-xl">
          <MarketingWhatsAppMock large />
        </div>
        <p className="mt-8 text-center text-body text-porter-text-secondary">No app. No signup. Just WhatsApp.</p>
      </div>
    </section>
  );
}
