"use client";

import type { SidebarNavItem } from "@/components/ui/Sidebar";
import { cn } from "@/lib/cn";
import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function MobileMoreSheet({
  open,
  onClose,
  items,
  pathname,
}: {
  open: boolean;
  onClose: () => void;
  items: SidebarNavItem[];
  pathname: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="More navigation">
      <button type="button" className="absolute inset-0 bg-black/60" aria-label="Close menu" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 max-h-[min(85dvh,520px)] overflow-y-auto rounded-t-2xl border border-porter-bg-border bg-porter-bg-elevated pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-between border-b border-porter-bg-border px-4 py-3">
          <span className="text-title text-porter-text-primary">More</span>
          <button
            ref={closeRef}
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-lg text-porter-text-secondary hover:bg-porter-bg-surface"
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
                  "flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold",
                  active ? "bg-porter-green-500/15 text-porter-green-400" : "text-porter-text-secondary hover:bg-porter-bg-surface",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden />
                {item.label}
                {item.badge != null && item.badge !== 0 ? (
                  <span className="ml-auto rounded-full bg-porter-orange-500 px-2 py-0.5 text-xs font-bold text-black">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
