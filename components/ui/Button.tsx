import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variantCls: Record<ButtonVariant, string> = {
  primary:
    "bg-porter-green-500 text-porter-bg-base hover:bg-porter-green-600 active:bg-porter-green-700 shadow-card focus-visible:ring-2 focus-visible:ring-porter-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-porter-bg-base",
  secondary:
    "border border-porter-bg-border bg-transparent text-porter-text-primary hover:bg-porter-bg-raised active:bg-porter-bg-surface focus-visible:ring-2 focus-visible:ring-porter-green-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-porter-bg-base",
  ghost:
    "bg-transparent text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary active:bg-porter-bg-surface focus-visible:ring-2 focus-visible:ring-porter-green-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-porter-bg-base",
  danger:
    "bg-porter-status-cancelled/90 text-white hover:bg-porter-status-cancelled active:brightness-95 focus-visible:ring-2 focus-visible:ring-porter-status-cancelled focus-visible:ring-offset-2 focus-visible:ring-offset-porter-bg-base",
};

const sizeCls: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3 text-sm gap-2 rounded-lg",
  md: "min-h-11 px-4 text-body gap-2 rounded-lg",
  lg: "min-h-12 px-6 text-base gap-2.5 rounded-xl",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center font-sans font-semibold transition-[transform,opacity,box-shadow] duration-fast ease-out",
        "disabled:pointer-events-none disabled:opacity-45",
        "active:scale-[0.98]",
        variantCls[variant],
        sizeCls[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Loader2 className="h-[1.15em] w-[1.15em] shrink-0 animate-spin text-current" aria-hidden />
          <span className="sr-only">Loading</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
