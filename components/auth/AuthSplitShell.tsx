import type { ReactNode } from "react";

export function AuthSplitShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[--bg-base] md:flex-row">
      <aside className="relative flex flex-col justify-between overflow-hidden border-b border-[--border] bg-[--bg-surface] px-6 py-8 md:w-[40%] md:max-w-xl md:border-b-0 md:border-r md:py-14 md:pl-10 md:pr-8 lg:pl-14">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `
              linear-gradient(to right, var(--border) 1px, transparent 1px),
              linear-gradient(to bottom, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative z-[1]">
          <p className="font-mono text-2xl font-semibold text-[--accent]">P</p>
          <p className="mt-2 font-mono text-xl font-medium tracking-tight text-[--text-primary]">Porter</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[--text-secondary]">{title}</p>
          <p className="mt-2 text-body text-[--text-muted]">{subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Inventory", "WhatsApp Orders", "Razorpay"].map((pill) => (
              <span
                key={pill}
                className="rounded-[var(--radius-sm)] border border-[--border] bg-[--bg-elevated] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-[--text-secondary]"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>
        <p className="relative z-[1] mt-10 hidden text-xs text-[--text-muted] md:block">
          Your store. Every WhatsApp. Zero friction.
        </p>
      </aside>

      <main className="flex flex-1 flex-col justify-center px-4 py-10 md:px-10 lg:px-16">{children}</main>
    </div>
  );
}
