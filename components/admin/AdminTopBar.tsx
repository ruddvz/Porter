"use client";

import { useAdminAuth } from "@/lib/admin-auth-context";
import { Button } from "@/components/ui/Button";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminTopBar() {
  const { session, logout } = useAdminAuth();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const norm = pathname?.endsWith("/") ? pathname : `${pathname}/`;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-space-3 border-b border-red-950/50 bg-porter-bg-base/95 px-space-3 backdrop-blur-md sm:px-space-4">
      <div className="flex min-w-0 items-center gap-space-2">
        <button
          type="button"
          className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-porter-text-primary hover:bg-porter-bg-surface lg:hidden"
          aria-label="Open admin menu"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="truncate font-display text-lg tracking-wide text-red-400/90">Porter Admin</span>
      </div>
      <div className="flex items-center gap-space-2 sm:gap-space-3">
        {session && (
          <span className="hidden max-w-[180px] truncate text-xs text-porter-text-secondary md:inline md:max-w-[240px] md:text-sm">
            {session.email}
          </span>
        )}
        <Button type="button" variant="ghost" size="sm" onClick={logout} className="text-porter-text-secondary">
          <LogOut className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/50" aria-label="Close menu" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[min(280px,88vw)] flex-col border-r border-porter-bg-border bg-porter-bg-surface shadow-modal">
            <div className="flex h-14 items-center justify-between border-b border-porter-bg-border px-space-3">
              <span className="text-label text-red-400">Menu</span>
              <button
                type="button"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-porter-text-muted"
                onClick={() => setOpen(false)}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-space-1 p-space-2">
              {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
                const active = norm === href || (href !== "/admin/" && norm.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      "flex min-h-11 items-center gap-space-3 rounded-md px-space-3 py-space-2 text-sm font-medium",
                      active ? "bg-porter-bg-raised text-porter-text-primary" : "text-porter-text-secondary"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
