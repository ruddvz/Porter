import { MessageCircle, PackageCheck, Smartphone } from "lucide-react";

const steps = [
  {
    n: "1",
    icon: Smartphone,
    title: "Customer texts your WhatsApp",
    body: "Any language — messy list, local names, mixed Hindi-Gujarati. Porter reads it like your counter staff.",
  },
  {
    n: "2",
    icon: MessageCircle,
    title: "Porter confirms & collects payment",
    body: "Address, area, Razorpay link or COD — the bot keeps the chat tight so you are not stuck on the phone.",
  },
  {
    n: "3",
    icon: PackageCheck,
    title: "You see the paid order on dashboard",
    body: "Live board, statuses, COD collection — pack once, deliver once, argue less.",
  },
];

export default function MarketingHow() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="font-display text-4xl tracking-wide text-porter-text-primary md:text-5xl">3 steps. That&apos;s it.</h2>
      <div className="mt-10 grid gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.n} className="relative">
            {i < steps.length - 1 && (
              <div className="absolute left-6 top-14 hidden h-px w-[calc(100%+2rem)] border-t border-dashed border-porter-bg-border md:block" aria-hidden />
            )}
            <div className="font-display text-6xl leading-none text-porter-green-500/40">{s.n}</div>
            <s.icon className="mt-4 h-8 w-8 text-porter-green-400" />
            <h3 className="mt-3 text-title text-porter-text-primary">{s.title}</h3>
            <p className="mt-2 text-body text-porter-text-secondary">{s.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
