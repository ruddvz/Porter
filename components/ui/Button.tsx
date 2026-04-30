"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const sharedCls =
  "inline-flex items-center justify-center gap-space-2 font-sans transition-[colors,transform,opacity] duration-[150ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-porter-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-porter-bg-base disabled:opacity-50 disabled:pointer-events-none";

const variantCls: Record<ButtonVariant, string> = {
  primary:
    "bg-porter-green-500 text-porter-bg-base font-semibold hover:bg-porter-green-700 active:bg-porter-green-600 border border-transparent",
  secondary:
    "bg-transparent text-porter-text-primary border border-porter-bg-border hover:border-porter-green-500/50 hover:bg-porter-bg-raised active:bg-porter-bg-surface",
  ghost:
    "bg-transparent text-porter-text-secondary border border-transparent hover:bg-porter-bg-raised hover:text-porter-text-primary active:bg-porter-bg-surface",
  danger:
    "bg-porter-status-cancelled/20 text-porter-status-cancelled border border-porter-status-cancelled/40 hover:bg-porter-status-cancelled/30 active:bg-porter-status-cancelled/25",
};

const sizeCls: Record<ButtonSize, string> = {
  sm: "min-h-11 px-space-3 text-sm rounded-md",
  md: "min-h-11 px-space-4 text-sm rounded-md",
  lg: "min-h-12 px-space-6 text-base rounded-lg",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  href?: string;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className,
  disabled,
  children,
  href,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const cls = cn(sharedCls, variantCls[variant], sizeCls[size], className);

  if (href && !loading && !isDisabled) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      disabled={isDisabled}
      aria-busy={loading}
      {...rest}
    >
      {loading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" aria-hidden /> : children}
    </button>
  );
}
