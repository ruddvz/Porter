"use client";

import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight, LogOut, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number | string | "dot";
};

export type SidebarProps = {
  brand?: string;
  subtitle?: ReactNode;
  items: SidebarNavItem[];
  userName: string;
  userAvatarUrl?: string | null;
  onLogout: () => void | Promise<void>;
  /** Controlled mobile drawer (e.g. hamburger in TopBar). */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  className?: string;
};

function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "?"
  );
}

export function Sidebar({
  brand = "PORTER",
  subtitle,
  items,
  userName,
  userAvatarUrl,
  onLogout,
  mobileOpen,
  onMobileOpenChange,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    onMobileOpenChange?.(false);
  }, [pathname, onMobileOpenChange]);

  const width = collapsed ? "w-16" : "w-60";

  const nav = (
    <>
      <div
        className={cn(
          "flex shrink-0 items-center gap-2 border-b border-porter-bg-border px-3 py-3",
          collapsed && "flex-col px-2",
        )}
      >
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl tracking-wide text-porter-green-500">{brand}</p>
            {subtitle && <p className="truncate text-xs text-porter-text-secondary">{subtitle}</p>}
          </div>
        )}
        <button
          type="button"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed((c) => !c)}
          className="hidden min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-porter-bg-border text-porter-text-secondary hover:bg-porter-bg-raised lg:inline-flex"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
          const Icon = it.icon;
          return (
            <Link
              key={it.href}
              href={it.href}
              title={collapsed ? it.label : undefined}
              className={cn(
                "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-fast",
                active
                  ? "border-l-2 border-porter-green-500 bg-porter-green-500/10 text-porter-text-primary"
                  : "border-l-2 border-transparent text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary",
                collapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-5 w-5 shrink-0 text-porter-green-400" />
              {!collapsed && <span className="flex-1 truncate">{it.label}</span>}
              {!collapsed && it.badge !== undefined && (
                <span className="flex items-center">
                  {it.badge === "dot" ? (
                    <span className="h-2 w-2 rounded-full bg-porter-orange-500" />
                  ) : (
                    <span className="min-w-[1.25rem] rounded-full bg-porter-orange-500/20 px-1.5 py-0.5 text-center text-[10px] font-bold text-porter-orange-500">
                      {typeof it.badge === "number" && it.badge > 99 ? "99+" : it.badge}
                    </span>
                  )}
                </span>
              )}
              {collapsed && it.badge !== undefined && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-porter-orange-500" aria-hidden />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("mt-auto border-t border-porter-bg-border p-2", collapsed && "px-1")}>
        <div className={cn("flex items-center gap-3 rounded-lg px-2 py-2", collapsed && "flex-col")}>
          {userAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userAvatarUrl} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-porter-bg-border text-sm font-bold text-porter-text-primary">
              {initials(userName)}
            </span>
          )}
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-porter-text-primary">{userName}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => void onLogout()}
          className={cn(
            "mt-1 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-porter-bg-border px-3 py-2 text-sm text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary",
            collapsed && "px-2",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Log out"}
        </button>
      </div>
    </>
  );

  const showMobile = mobileOpen !== undefined && onMobileOpenChange !== undefined;

  return (
    <>
      {showMobile && mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={() => onMobileOpenChange(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] max-w-[85vw] flex-col border-r border-porter-bg-border bg-porter-bg-surface shadow-modal animate-porter-modal-sheet">
            <div className="flex min-h-14 shrink-0 items-center justify-between border-b border-porter-bg-border px-3">
              <p className="font-display text-lg tracking-wide text-porter-green-500">{brand}</p>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => onMobileOpenChange(false)}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-porter-text-secondary hover:bg-porter-bg-raised"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{nav}</div>
          </aside>
        </div>
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-full flex-col border-r border-porter-bg-border bg-porter-bg-surface shadow-card transition-[width] duration-base ease-out lg:flex",
          width,
          className,
        )}
      >
        {nav}
      </aside>
    </>
  );
}
