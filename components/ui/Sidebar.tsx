"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useState } from "react";

export type SidebarNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: ReactNode;
  active?: boolean;
};

export type SidebarProps = {
  brand: ReactNode;
  items: SidebarNavItem[];
  userName: string;
  userAvatarUrl?: string | null;
  onLogout: () => void;
  className?: string;
  /** When set with onMobileOpenChange, mobile drawer is controlled (e.g. TopBar menu button). */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  /** Hide the default floating menu button (use when TopBar opens the drawer). */
  hideMobileMenuButton?: boolean;
};

function NavLinks({
  items,
  collapsed,
  onNavigate,
}: {
  items: SidebarNavItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-space-1 overflow-y-auto p-space-2" aria-label="Main">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            "flex min-h-11 items-center gap-space-3 rounded-md px-space-3 py-space-2 text-body font-medium transition-colors",
            item.active
              ? "border-l-2 border-porter-green-500 bg-porter-bg-raised text-porter-text-primary"
              : "border-l-2 border-transparent text-porter-text-secondary hover:bg-porter-bg-raised/80 hover:text-porter-text-primary"
          )}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center text-current">
            {item.icon}
          </span>
          {!collapsed && (
            <>
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.badge && <span className="shrink-0">{item.badge}</span>}
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}

function UserBlock({
  userName,
  userAvatarUrl,
  collapsed,
  onLogout,
}: {
  userName: string;
  userAvatarUrl?: string | null;
  collapsed: boolean;
  onLogout: () => void;
}) {
  const initials = userName
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="border-t border-porter-bg-border p-space-2">
      <div
        className={cn(
          "flex min-h-11 items-center gap-space-3 rounded-md px-space-2 py-space-2",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-porter-bg-border bg-porter-bg-raised text-label text-porter-green-400">
          {userAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userAvatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </div>
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-porter-text-primary">
              {userName}
            </p>
            <button
              type="button"
              onClick={onLogout}
              className="mt-1 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-porter-text-muted hover:text-porter-orange-500"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden />
              Log out
            </button>
          </div>
        )}
        {collapsed && (
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-porter-text-muted hover:bg-porter-bg-raised hover:text-porter-orange-500"
            aria-label="Log out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function Sidebar({
  brand,
  items,
  userName,
  userAvatarUrl,
  onLogout,
  className,
  mobileOpen: mobileOpenControlled,
  onMobileOpenChange,
  hideMobileMenuButton = false,
}: SidebarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const mobileOpen =
    mobileOpenControlled !== undefined ? mobileOpenControlled : internalOpen;
  const setMobileOpen = onMobileOpenChange ?? setInternalOpen;

  const [collapsed, setCollapsed] = useState(false);

  const closeMobile = useCallback(() => setMobileOpen(false), [setMobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [mobileOpen, setMobileOpen]);

  const shellClass = cn(
    "flex h-full shrink-0 flex-col border-r border-porter-bg-border bg-porter-bg-surface transition-[width] duration-[250ms] ease-out",
    collapsed ? "w-16" : "w-[240px]",
    className
  );

  return (
    <>
      {!hideMobileMenuButton && (
        <button
          type="button"
          className="fixed left-space-3 top-space-3 z-40 flex min-h-11 min-w-11 items-center justify-center rounded-md border border-porter-bg-border bg-porter-bg-surface text-porter-text-primary shadow-card lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <aside className={cn("hidden h-full lg:flex", shellClass)}>
        <div className="flex h-14 items-center justify-between gap-space-2 border-b border-porter-bg-border px-space-3">
          {!collapsed && <div className="min-w-0 flex-1 truncate">{brand}</div>}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-porter-green-500"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <NavLinks items={items} collapsed={collapsed} />
        <UserBlock
          userName={userName}
          userAvatarUrl={userAvatarUrl}
          collapsed={collapsed}
          onLogout={onLogout}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            aria-label="Close menu"
            onClick={closeMobile}
          />
          <div className="absolute left-0 top-0 flex h-full w-[min(280px,85vw)] max-w-full flex-col border-r border-porter-bg-border bg-porter-bg-surface shadow-modal animate-[modal-up_0.3s_cubic-bezier(0.16,1,0.3,1)_forwards]">
            <div className="flex h-14 items-center justify-between border-b border-porter-bg-border px-space-3 pr-12">
              <div className="min-w-0 flex-1 truncate">{brand}</div>
              <button
                type="button"
                onClick={closeMobile}
                className="absolute right-2 top-2 flex min-h-11 min-w-11 items-center justify-center rounded-md text-porter-text-secondary hover:bg-porter-bg-raised"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks items={items} collapsed={false} onNavigate={closeMobile} />
            <UserBlock
              userName={userName}
              userAvatarUrl={userAvatarUrl}
              collapsed={false}
              onLogout={() => {
                onLogout();
                closeMobile();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
