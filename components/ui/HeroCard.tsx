import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type HeroCardProps = {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  stats?: ReactNode;
  variant?: "default" | "green" | "orange";
  className?: string;
  children?: ReactNode;
};

const variantStyles = {
  default: "from-porter-bg-surface to-[var(--po-bg-warm)]",
  green: "from-porter-bg-surface to-[var(--po-surface-green)]",
  orange: "from-porter-bg-surface to-[var(--po-surface-orange)]",
};

export function HeroCard({
  title,
  description,
  eyebrow,
  actions,
  stats,
  variant = "default",
  className,
  children,
}: HeroCardProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--po-radius-xl)] border border-porter-bg-border bg-gradient-to-br p-5 shadow-card md:p-6",
        variantStyles[variant],
        className,
      )}
    >
      {eyebrow ? <p className="text-xs font-semibold uppercase tracking-wide text-porter-green-600">{eyebrow}</p> : null}
      <h2 className="mt-1 text-heading text-porter-text-primary">{title}</h2>
      {description ? <p className="mt-2 text-body text-porter-text-secondary">{description}</p> : null}
      {children}
      {stats ? <div className="mt-4 flex flex-wrap gap-3">{stats}</div> : null}
      {actions ? <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div> : null}
    </section>
  );
}
