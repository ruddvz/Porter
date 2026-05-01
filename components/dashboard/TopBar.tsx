"use client";

import { Button } from "@/components/ui/Button";
import type { Seller } from "@/types";
import { Bell, ChevronDown, LogOut, Menu, Package, Settings } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type TopBarRecentOrder = {
  id: string;
  customer_name: string | null;
  total_amount: number | null;
  created_at: string;
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

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} mins ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}

export default function TopBar({
  title,
  seller,
  pendingOrderCount,
  recentPendingOrders,
  onOpenNav,
  impersonating,
}: {
  title: string;
  seller: Seller;
  pendingOrderCount: number;
  recentPendingOrders: TopBarRecentOrder[];
  onOpenNav: () => void;
  impersonating?: boolean;
}) {
  const router = useRouter();
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (bellRef.current && !bellRef.current.contains(t)) setBellOpen(false);
      if (userRef.current && !userRef.current.contains(t)) setUserOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function exitImpersonate() {
    await fetch("/api/admin/impersonate", { method: "DELETE" });
    router.push("/admin/sellers");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-porter-bg-border bg-porter-bg-base/90 px-3 backdrop-blur lg:px-4">
      <button
        type="button"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-porter-bg-border text-porter-text-primary lg:hidden"
        aria-label="Open menu"
        onClick={onOpenNav}
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="hidden min-w-0 flex-1 lg:block">
        <p className="truncate font-display text-lg tracking-wide text-porter-green-500">PORTER</p>
        <p className="truncate text-xs text-porter-text-muted">{seller.store_name}</p>
      </div>
      <h1 className="min-w-0 flex-1 truncate text-center text-title text-porter-text-primary lg:flex-none lg:text-left">
        {title}
      </h1>
      <div className="flex shrink-0 items-center gap-1">
        {impersonating && (
          <Button type="button" variant="danger" size="sm" className="hidden sm:inline-flex" onClick={() => void exitImpersonate()}>
            Exit view
          </Button>
        )}
        <div className="relative" ref={bellRef}>
          <button
            type="button"
            className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-porter-text-secondary hover:bg-porter-bg-surface hover:text-porter-text-primary"
            aria-label="Notifications"
            onClick={() => {
              setBellOpen((v) => !v);
              setUserOpen(false);
            }}
          >
            <Bell className="h-5 w-5" />
            {pendingOrderCount > 0 && (
              <span className="absolute right-1 top-1 min-w-[1rem] rounded-full bg-porter-orange-500 px-1 text-center text-[10px] font-bold leading-tight text-porter-bg-base">
                {pendingOrderCount > 99 ? "99+" : pendingOrderCount}
              </span>
            )}
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-12 z-50 w-[min(100vw-2rem,320px)] rounded-xl border border-porter-bg-border bg-porter-bg-raised p-2 shadow-modal">
              <p className="px-2 py-1 text-label text-porter-text-muted">New orders</p>
              <div className="max-h-72 overflow-y-auto">
                {recentPendingOrders.length === 0 ? (
                  <p className="px-2 py-3 text-body text-porter-text-muted">No pending orders.</p>
                ) : (
                  recentPendingOrders.map((o) => (
                    <Link
                      key={o.id}
                      href="/dashboard"
                      className="block rounded-lg px-2 py-2 hover:bg-porter-bg-surface"
                      onClick={() => setBellOpen(false)}
                    >
                      <p className="text-sm font-semibold text-porter-text-primary">{o.customer_name || "Customer"}</p>
                      <p className="text-mono text-porter-text-secondary">
                        ₹{o.total_amount != null ? Math.round(Number(o.total_amount)) : "—"} · {timeAgo(o.created_at)}
                      </p>
                    </Link>
                  ))
                )}
              </div>
              <Link
                href="/dashboard/orders"
                className="mt-1 block rounded-lg px-2 py-2 text-center text-sm font-semibold text-porter-green-400 hover:bg-porter-bg-surface"
                onClick={() => setBellOpen(false)}
              >
                View all orders
              </Link>
            </div>
          )}
        </div>

        <div className="relative" ref={userRef}>
          <button
            type="button"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-porter-bg-border bg-porter-bg-surface text-sm font-bold text-porter-text-primary"
            aria-label="Account menu"
            onClick={() => {
              setUserOpen((v) => !v);
              setBellOpen(false);
            }}
          >
            {initials(seller.store_name)}
            <ChevronDown className="ml-1 hidden h-4 w-4 text-porter-text-muted sm:inline" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-porter-bg-border bg-porter-bg-raised py-1 shadow-modal">
              <Link
                href="/dashboard/settings"
                className="flex min-h-11 items-center gap-2 px-3 text-sm text-porter-text-primary hover:bg-porter-bg-surface"
                onClick={() => setUserOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                href="/dashboard/inventory"
                className="flex min-h-11 items-center gap-2 px-3 text-sm text-porter-text-primary hover:bg-porter-bg-surface lg:hidden"
                onClick={() => setUserOpen(false)}
              >
                <Package className="h-4 w-4" />
                Inventory
              </Link>
              <button
                type="button"
                className="flex w-full min-h-11 items-center gap-2 px-3 text-left text-sm text-porter-orange-500 hover:bg-porter-bg-surface"
                onClick={async () => {
                  const { createSupabaseBrowserClient } = await import("@/lib/supabase");
                  const supabase = createSupabaseBrowserClient();
                  await supabase.auth.signOut();
                  router.push("/");
                  router.refresh();
                }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
