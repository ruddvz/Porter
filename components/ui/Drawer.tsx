"use client";

import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type DrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Extra width on large screens (default ~28rem). */
  className?: string;
};

/**
 * Plan0 §13 — right panel on desktop, bottom sheet on small screens.
 * Focus trap + Escape to close (same behaviour family as Modal).
 */
export function Drawer({ open, onClose, title, children, footer, className }: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (!open || !panelRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      const focusables = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const list = Array.from(focusables).filter((el) => !el.hasAttribute("disabled"));
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [open, onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", trapFocus);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    queueMicrotask(() => panelRef.current?.querySelector<HTMLElement>("button, [href], input")?.focus());
    return () => {
      document.removeEventListener("keydown", trapFocus);
      document.body.style.overflow = prev;
    };
  }, [open, trapFocus]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-base"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "absolute z-[101] flex max-h-[92dvh] flex-col border-porter-bg-border bg-porter-bg-raised shadow-modal",
          "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-2xl border-t border-x animate-porter-modal-sheet",
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:bottom-auto sm:max-h-none sm:h-full sm:w-full sm:max-w-md sm:rounded-none sm:border sm:border-porter-bg-border sm:animate-porter-modal",
          className,
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-porter-bg-border sm:hidden" aria-hidden />
        <header className="flex min-h-14 shrink-0 items-center justify-between border-b border-porter-bg-border px-4 py-3">
          <h2 id={titleId} className="text-title text-porter-text-primary pr-2">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-porter-text-secondary hover:bg-porter-bg-surface hover:text-porter-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-porter-green-500/50"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 text-body text-porter-text-secondary">{children}</div>
        {footer && (
          <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-porter-bg-border px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
