import { cn } from "@/lib/cn";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type ListRowProps = {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
};

export function ListRow({ title, subtitle, leading, trailing, href, onClick, className }: ListRowProps) {
  const inner = (
    <>
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-semibold text-porter-text-primary">{title}</p>
        {subtitle ? <p className="truncate text-[13px] text-porter-text-muted">{subtitle}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {trailing}
        {(href || onClick) && !trailing ? <ChevronRight className="h-4 w-4 text-porter-text-muted" aria-hidden /> : null}
      </div>
    </>
  );

  const rowClass = cn(
    "flex min-h-16 items-center gap-3 rounded-[var(--po-radius-md)] px-3 py-2 transition-colors",
    (href || onClick) && "hover:bg-porter-bg-raised active:bg-porter-bg-surface",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={rowClass}>
        {inner}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(rowClass, "w-full text-left")}>
        {inner}
      </button>
    );
  }

  return <div className={rowClass}>{inner}</div>;
}
