import { cn } from "@/lib/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: ReactNode;
};

const variantCls: Record<ButtonVariant, string> = {
  primary:
    "bg-porter-green-500 text-white hover:bg-porter-green-600 active:bg-porter-green-700 shadow-card focus-visible:ring-2 focus-visible:ring-porter-green-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--po-bg)]",
  secondary:
    "border border-porter-bg-border bg-porter-bg-surface text-porter-text-primary hover:bg-porter-bg-raised active:bg-[var(--po-surface-green)] focus-visible:ring-2 focus-visible:ring-porter-green-500/30",
  ghost:
    "bg-transparent text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary active:bg-[var(--po-primary-soft)]",
  accent:
    "bg-porter-orange-500 text-white hover:bg-porter-orange-600 shadow-card focus-visible:ring-2 focus-visible:ring-porter-orange-500/40",
  danger:
    "bg-porter-status-cancelled text-white hover:brightness-95 active:brightness-90 focus-visible:ring-2 focus-visible:ring-porter-status-cancelled/50",
};

const sizeCls: Record<ButtonSize, string> = {
  sm: "min-h-11 px-3.5 text-sm gap-2 rounded-[var(--po-radius-sm)]",
  md: "min-h-11 px-4 text-[15px] gap-2 rounded-[var(--po-radius-sm)]",
  lg: "min-h-12 px-6 text-base gap-2.5 rounded-[var(--po-radius-md)]",
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
        "inline-flex items-center justify-center font-semibold transition-[transform,opacity,box-shadow,background-color] duration-fast ease-out",
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
