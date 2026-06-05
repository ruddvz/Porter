"use client";

import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { ListRow } from "@/components/ui/ListRow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Seller } from "@/types";
import { Bell, ExternalLink, HelpCircle, LogOut, Menu, Package, Settings, Store } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export type TopBarRecentOrder = {
  id: string;
  customer_name: string | null;
  total_amount: number | null;
  created_at: string;
  status?: string;
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

function NotificationList({
  recentPendingOrders,
  onNavigate,
}: {
  recentPendingOrders: TopBarRecentOrder[];
  onNavigate?: () => void;
}) {
  if (recentPendingOrders.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm font-semibold text-porter-text-primary">You are all caught up.</p>
        <p className="mt-1 text-sm text-porter-text-muted">No pending orders need action right now.</p>
      </div>
    );
  }
  return (
    <div className="space-y-1">
      {recentPendingOrders.map((o) => (
        <ListRow
          key={o.id}
          href="/dashboard"
          title={o.customer_name || "Customer"}
          subtitle={`₹${o.total_amount != null ? Math.round(Number(o.total_amount)) : "—"} · ${timeAgo(o.created_at)}`}
          trailing={o.status ? <StatusBadge status={o.status} /> : null}
          onClick={onNavigate}
        />
      ))}
    </div>
  );
}

function ProfileMenu({ seller, onClose }: { seller: Seller; onClose: () => void }) {
  const router = useRouter();
  const storeSlug = seller.store_slug;

  return (
    <div className="space-y-1">
      <ListRow href="/dashboard/settings" title="Store settings" leading={<Settings className="h-5 w-5 text-porter-green-600" />} onClick={onClose} />
      <ListRow href="/dashboard/inventory" title="Inventory" leading={<Package className="h-5 w-5 text-porter-green-600" />} onClick={onClose} />
      {storeSlug ? (
        <ListRow
          href={`/store/${storeSlug}`}
          title="View public store"
          leading={<Store className="h-5 w-5 text-porter-green-600" />}
          trailing={<ExternalLink className="h-4 w-4 text-porter-text-muted" />}
          onClick={onClose}
        />
      ) : null}
      <ListRow
        href="https://github.com/ruddvz/Porter/blob/main/README.md"
        title="Help and setup"
        leading={<HelpCircle className="h-5 w-5 text-porter-green-600" />}
        onClick={onClose}
      />
      <ListRow
        title="Log out"
        leading={<LogOut className="h-5 w-5 text-porter-orange-500" />}
        onClick={async () => {
          onClose();
          const { createSupabaseBrowserClient } = await import("@/lib/supabase");
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut();
          router.push("/");
          router.refresh();
        }}
      />
    </div>
  );
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
  const [isMobile, setIsMobile] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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
    <>
      <header className="safe-top sticky top-0 z-30 flex min-h-[var(--app-topbar-height)] shrink-0 items-center gap-3 border-b border-porter-bg-border bg-porter-bg-surface/95 px-3 shadow-[0_1px_0_var(--po-line)] backdrop-blur lg:px-4">
        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--po-radius-sm)] border border-porter-bg-border text-porter-text-primary lg:hidden"
          aria-label="Open menu"
          onClick={onOpenNav}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3 lg:hidden">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--po-radius-sm)] bg-[var(--po-primary-soft)] text-sm font-bold text-porter-green-600">
            {initials(seller.store_name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-porter-text-primary">{seller.store_name}</p>
            <p className="truncate text-xs text-porter-text-muted">{title}</p>
          </div>
        </div>

        <h1 className="hidden min-w-0 flex-1 truncate text-title text-porter-text-primary lg:block">{title}</h1>

        <div className="flex shrink-0 items-center gap-1">
          {impersonating && (
            <Button type="button" variant="danger" size="sm" className="hidden sm:inline-flex" onClick={() => void exitImpersonate()}>
              Exit view
            </Button>
          )}
          <div className="relative" ref={bellRef}>
            <button
              type="button"
              className="relative inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--po-radius-sm)] text-porter-text-secondary hover:bg-porter-bg-raised hover:text-porter-text-primary"
              aria-label="Notifications"
              onClick={() => {
                setBellOpen((v) => !v);
                setUserOpen(false);
              }}
            >
              <Bell className="h-5 w-5" />
              {pendingOrderCount > 0 && (
                <span className="absolute right-1 top-1 min-w-[1rem] rounded-full bg-porter-orange-500 px-1 text-center text-[10px] font-bold leading-tight text-white">
                  {pendingOrderCount > 99 ? "99+" : pendingOrderCount}
                </span>
              )}
            </button>
            {bellOpen && !isMobile && (
              <div className="absolute right-0 top-12 z-50 hidden w-[min(100vw-2rem,320px)] rounded-[var(--po-radius-lg)] border border-porter-bg-border bg-porter-bg-raised p-2 shadow-modal lg:block">
                <p className="px-2 py-1 text-label text-porter-text-muted">New orders</p>
                <NotificationList recentPendingOrders={recentPendingOrders} onNavigate={() => setBellOpen(false)} />
                <Link
                  href="/dashboard"
                  className="mt-1 block rounded-lg px-2 py-2 text-center text-sm font-semibold text-porter-green-600 hover:bg-porter-bg-surface"
                  onClick={() => setBellOpen(false)}
                >
                  View live orders
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
            </button>
            {userOpen && !isMobile && (
              <div className="absolute right-0 top-12 z-50 hidden w-52 rounded-[var(--po-radius-lg)] border border-porter-bg-border bg-porter-bg-raised py-1 shadow-modal lg:block">
                <ProfileMenu seller={seller} onClose={() => setUserOpen(false)} />
              </div>
            )}
          </div>
        </div>
      </header>

      <Drawer open={bellOpen && isMobile} onClose={() => setBellOpen(false)} title="New orders">
        <NotificationList recentPendingOrders={recentPendingOrders} onNavigate={() => setBellOpen(false)} />
        <Link
          href="/dashboard"
          className="mt-4 block rounded-[var(--po-radius-pill)] bg-porter-green-500 py-3 text-center text-sm font-bold text-white"
          onClick={() => setBellOpen(false)}
        >
          View live orders
        </Link>
      </Drawer>

      <Drawer open={userOpen && isMobile} onClose={() => setUserOpen(false)} title="Account">
        <ProfileMenu seller={seller} onClose={() => setUserOpen(false)} />
      </Drawer>
    </>
  );
}
