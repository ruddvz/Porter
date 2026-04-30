"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Step =
  | { kind: "msg"; from: "customer" | "bot"; text: string }
  | { kind: "typing" };

const STEPS: Step[] = [
  { kind: "msg", from: "customer", text: "bhai 5 kilo bataka ane 2 litre tael" },
  { kind: "typing" },
  {
    kind: "msg",
    from: "bot",
    text: "Order: Potato 5kg, Oil 2L — Total ₹248. Reply 1 Online, 2 COD.",
  },
  { kind: "msg", from: "customer", text: "1" },
  { kind: "msg", from: "bot", text: "Kayu area? Manjalpur / Tarsali / Maneja" },
  { kind: "msg", from: "customer", text: "manjalpur" },
  { kind: "msg", from: "bot", text: "Building + flat number moklo" },
  { kind: "msg", from: "customer", text: "Sunshine Apt B-204" },
  {
    kind: "msg",
    from: "bot",
    text: "Confirmed! Pay ₹330 here: pay.porter.app/demo",
  },
];

const STEP_MS = 700;
const PAUSE_MS = 4000;

export function WhatsAppDemo({ className, large = false }: { className?: string; large?: boolean }) {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible >= STEPS.length) {
      const pause = setTimeout(() => setVisible(0), PAUSE_MS);
      return () => clearTimeout(pause);
    }
    const t = setTimeout(() => setVisible((v) => v + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div
      className={cn(
        "rounded-2xl border border-porter-bg-border bg-[#0b141a] p-space-4 shadow-raised",
        large && "p-space-6",
        className
      )}
      aria-label="Animated WhatsApp order example"
    >
      <div className="mb-space-3 flex items-center gap-space-2 border-b border-white/10 pb-space-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-porter-green-500 text-xs font-bold text-porter-bg-base">
          P
        </div>
        <div>
          <p className="text-sm font-semibold text-porter-text-primary">Porter Demo</p>
          <p className="text-xs text-porter-text-muted">online</p>
        </div>
      </div>
      <div className={cn("flex flex-col gap-space-3", large && "gap-space-4")}>
        {STEPS.map((step, i) => {
          const on = i < visible;
          if (step.kind === "typing") {
            return (
              <div
                key={`t-${i}`}
                className={cn(
                  "flex justify-end transition-all duration-500 ease-out",
                  on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0 overflow-hidden py-0"
                )}
              >
                <div className="max-w-[85%] rounded-lg rounded-tr-sm bg-porter-bg-raised px-space-3 py-space-2">
                  <span className="inline-flex gap-1 text-porter-text-secondary">
                    <span className="animate-pulse">●</span>
                    <span className="animate-pulse delay-75">●</span>
                    <span className="animate-pulse delay-150">●</span>
                  </span>
                </div>
              </div>
            );
          }
          const isBot = step.from === "bot";
          return (
            <div
              key={`m-${i}`}
              className={cn(
                "flex transition-all duration-500 ease-out",
                isBot ? "justify-end" : "justify-start",
                on ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 h-0 overflow-hidden py-0"
              )}
            >
              <div
                className={cn(
                  "max-w-[90%] rounded-lg px-space-3 py-space-2 text-sm leading-relaxed",
                  isBot
                    ? "rounded-tr-sm bg-porter-green-900/50 text-porter-text-primary border border-porter-green-700/30"
                    : "rounded-tl-sm bg-porter-bg-surface text-porter-text-primary border border-porter-bg-border"
                )}
              >
                {step.text}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-space-4 text-center text-xs text-porter-text-muted">Demo animation — loops automatically</p>
    </div>
  );
}
