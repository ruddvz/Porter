"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from "react";

export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusable = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const list = Array.from(focusable).filter((el) => !el.hasAttribute("disabled"));
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    if (!previouslyFocused.current) {
      previouslyFocused.current = document.activeElement as HTMLElement;
    }
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("button, [href], input")?.focus();
    }, 0);
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
      previouslyFocused.current = null;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-space-6">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          "relative z-[1] flex max-h-[90vh] w-full max-w-lg flex-col rounded-t-2xl border border-porter-bg-border bg-porter-bg-raised shadow-modal sm:rounded-2xl",
          "max-sm:animate-[modal-up_0.35s_cubic-bezier(0.16,1,0.3,1)_forwards]",
          "sm:animate-[modal-fade_0.25s_ease-out_forwards]",
          className
        )}
      >
        <div className="flex items-center justify-between border-b border-porter-bg-border px-space-4 py-space-3 sm:px-space-6">
          <h2 id={titleId} className="text-title text-porter-text-primary pr-space-4">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-porter-text-secondary transition-colors hover:bg-porter-bg-surface hover:text-porter-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-porter-green-500"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-space-4 py-space-4 sm:px-space-6">
          {children}
        </div>
        {footer && (
          <div className="flex justify-end gap-space-3 border-t border-porter-bg-border px-space-4 py-space-4 sm:px-space-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
