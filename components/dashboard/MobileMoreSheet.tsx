"use client";

import type { SidebarNavItem } from "@/components/ui/Sidebar";
import { cn } from "@/lib/cn";
import { HelpCircle, LogOut, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function MobileMoreSheet({
  open,
  onClose,
  items,
  pathname,
  onLogout,
}: {
  open: boolean;
  onClose: () => void;
  items: SidebarNavItem[];
  pathname: string;
  onLogout?: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More navigation">
      <button type="button" className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-label="Close menu" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[min(88dvh,calc(100dvh-env(safe-area-inset-top)-24px))] overflow-y-auto rounded-t-[var(--po-radius-xl)] border border-porter-bg-border bg-porter-bg-raised shadow-[var(--po-shadow-sheet)]">
        <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-porter-bg-border" aria-hidden />
        <div className="flex items-center justify-between border-b border-porter-bg-border px-4 py-3">
          <span className="text-title text-porter-text-primary">More</span>
          <button
            ref={closeRef}
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-[var(--po-radius-sm)] text-porter-text-secondary hover:bg-porter-bg-surface"
            aria-label="Close"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/dashboard/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex min-h-16 items-center gap-3 rounded-[var(--po-radius-md)] px-4 py-3 text-[15px] font-semibold",
                  active ? "bg-[var(--po-primary-soft)] text-porter-green-600" : "text-porter-text-secondary hover:bg-porter-bg-surface",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {item.label}
                {item.badge != null && item.badge !== 0 ? (
                  <span className="ml-auto rounded-full bg-porter-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
          <Link
            href="https://github.com/ruddvz/Porter/blob/main/README.md"
            onClick={onClose}
            className="flex min-h-16 items-center gap-3 rounded-[var(--po-radius-md)] px-4 py-3 text-[15px] font-semibold text-porter-text-secondary hover:bg-porter-bg-surface"
          >
            <HelpCircle className="h-5 w-5 shrink-0 text-porter-green-600" aria-hidden />
            Help and setup
          </Link>
          {onLogout ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="flex min-h-16 w-full items-center gap-3 rounded-[var(--po-radius-md)] px-4 py-3 text-left text-[15px] font-semibold text-porter-orange-500 hover:bg-porter-bg-surface"
            >
              <LogOut className="h-5 w-5 shrink-0" aria-hidden />
              Log out
            </button>
          ) : null}
        </nav>
        <div className="h-[calc(env(safe-area-inset-bottom)+12px)]" aria-hidden />
      </div>
    </div>
  );
}
