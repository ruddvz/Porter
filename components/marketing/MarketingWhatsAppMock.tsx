import { Card } from "@/components/ui/Card";

function Bubble({ side, children, delaySec }: { side: "left" | "right"; children: React.ReactNode; delaySec: number }) {
  return (
    <div className={`wa-bubble flex ${side === "right" ? "justify-end" : "justify-start"}`} style={{ animationDelay: `${delaySec}s` }}>
      <div
        className={`max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-card ${
          side === "left"
            ? "rounded-tl-sm border border-porter-bg-border bg-porter-bg-raised text-porter-text-primary"
            : "rounded-tr-sm bg-porter-green-500/20 text-porter-text-primary"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

export default function MarketingWhatsAppMock({ large }: { large?: boolean }) {
  return (
    <Card padding="md" variant="raised" className="overflow-hidden">
      <p className="text-center text-xs font-semibold uppercase tracking-wider text-porter-text-muted">WhatsApp</p>
      <div className={`mt-4 space-y-3 rounded-xl bg-porter-bg-base/80 p-3 ${large ? "min-h-[420px]" : "min-h-[320px]"}`}>
        <Bubble side="right" delaySec={0}>
          bhai 5 kilo bataka ane 2 litre tael
        </Bubble>
        <Bubble side="left" delaySec={0.9}>
          <span className="text-porter-text-muted">…</span>
        </Bubble>
        <Bubble side="left" delaySec={1.8}>
          Order: Potato 5kg, Oil 2L — ₹330
          <br />
          Reply 1 for Online, 2 for COD
        </Bubble>
        <Bubble side="right" delaySec={2.7}>
          1
        </Bubble>
        <Bubble side="left" delaySec={3.6}>
          Kayo area? Manjalpur / Tarsali / Maneja
        </Bubble>
        <Bubble side="right" delaySec={4.5}>
          manjalpur
        </Bubble>
        <Bubble side="left" delaySec={5.4}>
          Building + flat number moklo
        </Bubble>
        <Bubble side="right" delaySec={6.3}>
          Sunshine Apt B-204
        </Bubble>
        <Bubble side="left" delaySec={7.2}>
          Confirmed! Pay ₹330 here: porter.pay/…
        </Bubble>
      </div>
    </Card>
  );
}
