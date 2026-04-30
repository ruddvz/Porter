"use client";

import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/lib/admin-nav";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar() {
  const pathname = usePathname();
  const norm = pathname?.endsWith("/") ? pathname : `${pathname}/`;

  return (
    <aside className="hidden w-[220px] shrink-0 flex-col border-r border-red-950/40 bg-porter-bg-surface lg:flex">
      <div className="border-b border-porter-bg-border px-space-4 py-space-4">
        <div className="flex items-center gap-space-2">
          <span className="font-display text-xl tracking-wide text-porter-green-500">PORTER</span>
          <span className="rounded border border-red-600/60 bg-red-950/40 px-space-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-400">
            Admin
          </span>
        </div>
        <p className="mt-space-1 text-xs text-porter-text-muted">Internal operations</p>
      </div>
      <nav className="flex flex-1 flex-col gap-space-1 p-space-2" aria-label="Admin">
        {ADMIN_NAV.map(({ href, label, icon: Icon }) => {
          const active = norm === href || (href !== "/admin/" && norm.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex min-h-11 items-center gap-space-3 rounded-md px-space-3 py-space-2 text-sm font-medium transition-colors",
                active
                  ? "border-l-2 border-red-500 bg-porter-bg-raised text-porter-text-primary"
                  : "border-l-2 border-transparent text-porter-text-secondary hover:bg-porter-bg-raised/80"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-porter-bg-border p-space-3 text-xs text-porter-text-muted">
        Desktop-first · secure backends only for mutations
      </div>
    </aside>
  );
}
