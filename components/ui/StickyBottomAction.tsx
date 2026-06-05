"use client";

import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

/** Sticky bottom bar for mobile sheets / checkout / onboarding — respects safe area. */
export function StickyBottomAction({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 border-t border-porter-bg-border bg-porter-bg-surface/95 px-4 py-3 backdrop-blur safe-bottom",
        className,
      )}
    >
      {children}
    </div>
  );
}
