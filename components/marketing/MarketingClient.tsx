"use client";

import { useEffect, useState } from "react";

/** Full marketing landing: hero, problem, how-it-works, features, pricing, demo, FAQ, footer. */
export default function MarketingClient() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#e8f0eb]">
      <Nav />

      <Hero />

      <Problem />

      <HowItWorks />

      <Features />

      <Pricing />

      <DemoChat />

      <Faq />

      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0A0F0D]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <a href="/" className="font-display text-3xl tracking-wide text-[#25D366]">
          PORTER
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#how" className="hover:text-white">
            How It Works
          </a>
          <a href="#pricing" className="hover:text-white">
            Pricing
          </a>
          <a href="#demo" className="hover:text-white">
            Demo
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <a
            href="/auth/signup"
            className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-black"
          >
            Start Free Trial
          </a>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-10 md:pt-16">
      <p className="text-sm font-medium text-[#FF6B35]">WhatsApp pe aao, orders aayenge 🚀</p>
      <h1 className="mt-4 font-display text-[clamp(3rem,12vw,7rem)] leading-[0.95] tracking-wide text-white">
        YOUR SHOP.
        <br />
        ON WHATSAPP.
        <br />
        <span className="text-[#25D366]">ON AUTOPILOT.</span>
      </h1>
      <p className="mt-6 max-w-xl text-base text-white/70">
        Customers text their order in Gujarati, Hindi, or English. Your AI bot confirms it, collects the address, and sends a payment link. You just pack and deliver.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="/auth/signup"
          className="rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-black"
        >
          Start Free — No Card Needed
        </a>
        <button
          type="button"
          onClick={() => document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" })}
          className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white"
        >
          Watch Demo →
        </button>
      </div>
      <p className="mt-8 text-sm text-white/50">Trusted by 50+ shops in Vadodara, Surat & Ahmedabad</p>
      <div className="mt-3 flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-8 w-8 rounded-full bg-gradient-to-br from-[#25D366] to-[#111A14] opacity-60" />
        ))}
      </div>

      <div className="mt-12 max-w-md rounded-2xl border border-white/10 bg-[#111A14] p-4 shadow-2xl">
        <HeroChatMock />
      </div>
    </section>
  );
}

function HeroChatMock() {
  return (
    <div className="space-y-2 font-mono text-xs md:text-sm">
      <Bubble side="left" delay="0s" text="5 kg bataka ane 2 litre tel" />
      <Bubble side="right" delay="0.8s" text="Got it! Total ₹320. Area moklo?" />
      <Bubble side="left" delay="1.6s" text="Manjalpur" />
      <Bubble side="right" delay="2.4s" text="Address moklo — full building + flat." />
    </div>
  );
}

function Bubble({ side, text, delay }: { side: "left" | "right"; text: string; delay: string }) {
  return (
    <div
      className={`flex ${side === "left" ? "justify-start" : "justify-end"} animate-hero-bubble opacity-0`}
      style={{ animationDelay: delay } as React.CSSProperties}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 ${
          side === "left" ? "rounded-bl-md bg-[#202C26] text-white/90" : "rounded-br-md bg-[#25D366] text-black"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function Problem() {
  const cards = [
    { emoji: "🤯", t: "Customer calls while you're at the counter — you forget half the list." },
    { emoji: "📵", t: "WhatsApp messages pile up — you see them 2 hours later." },
    { emoji: "💸", t: "No payment upfront — customers cancel last minute." },
  ];
  return (
    <section className="border-t border-white/5 bg-black/20 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl text-white md:text-5xl">Aapni shop mathi kitla orders miss thay chhe?</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <div key={c.emoji} className="rounded-2xl border border-white/10 bg-[#111A14] p-5">
              <p className="text-3xl">{c.emoji}</p>
              <p className="mt-3 text-sm text-white/75">{c.t}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl text-white md:text-5xl">3 steps. That&apos;s it.</h2>
        <div className="mt-10 space-y-8 md:space-y-0 md:flex md:items-start md:justify-between">
          {[
            {
              n: "1",
              title: "Customer texts your WhatsApp",
              body: "They send their grocery list in any language they like.",
            },
            {
              n: "2",
              title: "AI bot confirms & collects details",
              body: "Area, address, order summary, and Razorpay payment link.",
            },
            {
              n: "3",
              title: "You pack from the dashboard",
              body: "Paid orders land live. You deliver. Simple.",
            },
          ].map((s, i) => (
            <div key={s.n} className="relative flex-1 md:px-4">
              {i < 2 && (
                <div className="absolute left-6 top-12 hidden h-0.5 w-full bg-gradient-to-r from-[#25D366]/50 to-transparent md:block" />
              )}
              <div className="flex items-start gap-4">
                <span className="font-display text-5xl text-[#25D366]">{s.n}</span>
                <div>
                  <p className="font-semibold text-white">{s.title}</p>
                  <p className="mt-2 text-sm text-white/65">{s.body}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    "🇮🇳 Gujarati + Hindi + English — bot understands all three, no setup needed.",
    "💳 Instant UPI/Razorpay Payment Links — clear money before you pack.",
    "📦 Live Order Dashboard — statuses and payments in one dark screen.",
    "🤖 AI Order Parser — “5 kilo bataka” becomes a line item automatically.",
    "📍 Smart Address Collection — area + full address, saved for next time.",
    "🔔 Real-time Alerts — new orders pop in with a soft ping.",
  ];
  return (
    <section className="border-t border-white/5 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((t) => (
            <div key={t} className="rounded-2xl border border-white/10 bg-[#111A14] p-5 text-sm text-white/80">
              {t}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl text-white md:text-5xl">Simple pricing. No surprises.</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#111A14] p-6">
            <p className="text-sm uppercase tracking-wide text-white/50">Starter</p>
            <p className="mt-2 font-display text-5xl text-white">
              ₹999<span className="text-lg text-white/50">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li>• 1 WhatsApp number</li>
              <li>• Up to 500 orders/month</li>
              <li>• Live order dashboard</li>
              <li>• AI order parsing</li>
              <li>• Payment link integration</li>
            </ul>
            <a
              href="/auth/signup"
              className="mt-8 inline-block w-full rounded-full border border-white/20 py-3 text-center text-sm font-semibold text-white"
            >
              Start 14-Day Free Trial
            </a>
          </div>
          <div className="relative rounded-2xl border-2 border-[#25D366] bg-[#111A14] p-6 shadow-[0_0_40px_rgba(37,211,102,0.15)]">
            <span className="absolute right-4 top-4 rounded-full bg-[#FF6B35] px-2 py-1 text-xs font-bold text-black">
              Most Popular
            </span>
            <p className="text-sm uppercase tracking-wide text-white/50">Growth</p>
            <p className="mt-2 font-display text-5xl text-[#25D366]">
              ₹1,999<span className="text-lg text-white/50">/mo</span>
            </p>
            <ul className="mt-6 space-y-2 text-sm text-white/70">
              <li>• 1 WhatsApp number</li>
              <li>• Unlimited orders</li>
              <li>• Everything in Starter</li>
              <li>• Customer order history</li>
              <li>• CSV export</li>
              <li>• Priority support</li>
            </ul>
            <a
              href="/auth/signup"
              className="mt-8 inline-block w-full rounded-full bg-[#25D366] py-3 text-center text-sm font-semibold text-black"
            >
              Start 14-Day Free Trial
            </a>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-white/45">No contract. Cancel anytime. Setup takes 15 minutes.</p>
      </div>
    </section>
  );
}

const DEMO_CHAT_STEPS = [
  { side: "left" as const, text: "bhai 5 kilo aloo ane 2 litre sunflower oil" },
  { side: "right" as const, text: "Order: Aloo 5kg, Oil 2L — Total ₹310. Tamaru area?" },
  { side: "left" as const, text: "manjalpur" },
  { side: "right" as const, text: "Saras. Full address moklo (building + flat)." },
  { side: "left" as const, text: "Sunshine Apt B-204" },
  { side: "right" as const, text: "Pay ₹310 here 👇 razorpay.link/demo — order confirm! 🛵" },
];

function DemoChat() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const step = setInterval(() => {
      setVisible((v) => (v >= DEMO_CHAT_STEPS.length ? 0 : v + 1));
    }, 2000);
    const loop = setInterval(() => setVisible(0), 12000);
    return () => {
      clearInterval(step);
      clearInterval(loop);
    };
  }, []);

  return (
    <section id="demo" className="border-t border-white/5 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display text-4xl text-white md:text-5xl">See exactly what your customers will experience.</h2>
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-white/10 bg-[#0d1410] p-4">
          <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2">
            <span className="h-2 w-2 rounded-full bg-[#25D366]" />
            <span className="text-xs text-white/50">WhatsApp</span>
          </div>
          <div className="min-h-[280px] space-y-2">
            {DEMO_CHAT_STEPS.map((s, idx) => (
              <div
                key={idx}
                className={`flex ${s.side === "left" ? "justify-start" : "justify-end"} transition-opacity duration-500 ${
                  idx < visible ? "opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs ${
                    s.side === "left" ? "rounded-bl-sm bg-[#202C26] text-white/90" : "rounded-br-sm bg-[#25D366] text-black"
                  }`}
                >
                  {s.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    {
      q: "Do my customers need to install any app?",
      a: "No. They use the WhatsApp they already have. Same number, same chat.",
    },
    {
      q: "What if my customer writes in Gujarati?",
      a: "The bot understands Gujarati, Hindi, and English mixed together.",
    },
    {
      q: "Is my product list hard to set up?",
      a: "You add items on the Porter dashboard. Most shops finish in about 10 minutes.",
    },
    {
      q: "What if I already use WhatsApp Business?",
      a: "You connect your existing number with Meta Cloud API. Customers see no change.",
    },
  ];
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="font-display text-4xl text-white">FAQ</h2>
        <div className="mt-8 space-y-2">
          {items.map((it, idx) => (
            <div key={it.q} className="rounded-xl border border-white/10 bg-[#111A14]">
              <button
                type="button"
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium text-white"
                onClick={() => setOpen(open === idx ? -1 : idx)}
              >
                {it.q}
                <span className="text-white/50">{open === idx ? "−" : "+"}</span>
              </button>
              {open === idx && <p className="border-t border-white/5 px-4 py-3 text-sm text-white/70">{it.a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-3xl text-[#25D366]">PORTER</p>
          <p className="mt-2 text-sm text-white/60">WhatsApp-first orders for local India.</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-white/50">
          <a href="/privacy" className="hover:text-white">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white">
            Terms
          </a>
          <a href="mailto:hello@porter.app" className="hover:text-white">
            Contact
          </a>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-white/35">Made for Gujarat. Built for Bharat.</p>
    </footer>
  );
}
