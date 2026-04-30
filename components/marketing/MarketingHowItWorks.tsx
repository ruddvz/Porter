import { MessageCircle, MapPin, BadgeCheck } from "lucide-react";

const steps = [
  {
    n: "1",
    icon: MessageCircle,
    title: "Customer texts your WhatsApp",
    body: "Any language they are comfortable with — list, address hints, payment choice.",
  },
  {
    n: "2",
    icon: MapPin,
    title: "Porter confirms and collects details",
    body: "The bot locks items, area, address, and sends Razorpay or marks COD — you do not chase screenshots.",
  },
  {
    n: "3",
    icon: BadgeCheck,
    title: "You see the paid order on the dashboard",
    body: "Pack from a clear line sheet. Dispatch and mark delivered when the rider finishes.",
  },
];

export function MarketingHowItWorks() {
  return (
    <section id="how" className="border-t border-porter-bg-border py-space-12 sm:py-space-16">
      <div className="mx-auto max-w-6xl px-space-4 sm:px-space-6">
        <h2 className="text-display text-porter-text-primary md:text-[52px]">3 steps. That&apos;s it.</h2>
        <div className="mt-space-12 grid gap-space-8 md:grid-cols-3 md:gap-space-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative flex flex-col items-center text-center md:items-start md:text-left">
              {i < steps.length - 1 && (
                <div
                  className="absolute left-1/2 top-10 hidden h-0.5 w-full -translate-y-1/2 border-t border-dashed border-porter-bg-border md:block md:left-[60%] md:w-[80%]"
                  aria-hidden
                />
              )}
              <div className="relative z-[1] flex flex-col items-center md:items-start">
                <span className="font-display text-7xl leading-none text-porter-green-500/40 md:text-8xl">
                  {s.n}
                </span>
                <s.icon className="mb-space-3 mt-space-2 h-8 w-8 text-porter-green-500" aria-hidden />
                <h3 className="text-title text-porter-text-primary">{s.title}</h3>
                <p className="mt-space-2 text-body text-porter-text-secondary">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
