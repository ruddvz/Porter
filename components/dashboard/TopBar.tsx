"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  ChevronDown,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export type TopBarNotification = {
  id: string;
  customerName: string;
  totalRupee: number;
  relativeTime: string;
};

export type TopBarProps = {
  title: string;
  /** Desktop-only store label (optional). */
  storeName?: string;
  onMenuOpen?: () => void;
  notifications?: TopBarNotification[];
  userName: string;
  onLogout: () => void;
  className?: string;
};

export function TopBar({
  title,
  storeName,
  onMenuOpen,
  notifications = [],
  userName,
  onLogout,
  className,
}: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setNotifOpen(false);
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = userName
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const unread = notifications.length;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-space-3 border-b border-porter-bg-border bg-porter-bg-base/90 px-space-3 backdrop-blur-md sm:px-space-4 lg:pl-space-4 lg:pr-space-6",
        className
      )}
    >
      <button
        type="button"
        className="flex min-h-11 min-w-11 items-center justify-center rounded-md text-porter-text-primary hover:bg-porter-bg-surface lg:hidden"
        aria-label="Open navigation"
        onClick={onMenuOpen}
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden min-w-0 flex-1 lg:block">
        {storeName && (
          <p className="truncate font-display text-lg tracking-wide text-porter-green-500">
            {storeName}
          </p>
        )}
      </div>

      <h1 className="min-w-0 flex-1 truncate text-center text-title text-porter-text-primary lg:flex-none lg:text-left">
        {title}
      </h1>

      <div ref={wrapRef} className="flex shrink-0 items-center gap-space-1 sm:gap-space-2">
        <div className="relative">
          <button
            type="button"
            className="relative flex min-h-11 min-w-11 items-center justify-center rounded-md text-porter-text-secondary hover:bg-porter-bg-surface hover:text-porter-text-primary"
            aria-expanded={notifOpen}
            aria-haspopup="true"
            onClick={() => {
              setNotifOpen((o) => !o);
              setUserOpen(false);
            }}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-porter-orange-500 px-1 text-[10px] font-bold text-porter-bg-base">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full z-50 mt-space-2 w-[min(100vw-2rem,320px)] rounded-xl border border-porter-bg-border bg-porter-bg-raised py-space-2 shadow-modal">
              <p className="px-space-4 pb-space-2 text-label text-porter-text-muted">Recent</p>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="px-space-4 py-space-3 text-body text-porter-text-muted">
                    No new orders
                  </li>
                ) : (
                  notifications.map((n) => (
                    <li key={n.id} className="border-b border-porter-bg-border/60 last:border-0">
                      <Link
                        href="/dashboard/orders/"
                        className="block px-space-4 py-space-3 text-left hover:bg-porter-bg-surface"
                        onClick={() => setNotifOpen(false)}
                      >
                        <p className="text-sm font-semibold text-porter-text-primary">
                          {n.customerName}
                        </p>
                        <p className="text-mono text-porter-text-secondary">
                          ₹{n.totalRupee.toLocaleString("en-IN")} · {n.relativeTime}
                        </p>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
              <div className="border-t border-porter-bg-border px-space-3 pt-space-2">
                <Link
                  href="/dashboard/orders/"
                  className="block rounded-md py-space-2 text-center text-sm font-semibold text-porter-green-400 hover:bg-porter-bg-surface"
                  onClick={() => setNotifOpen(false)}
                >
                  View all orders
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            className="flex min-h-11 min-w-11 items-center justify-center rounded-full border border-porter-bg-border bg-porter-bg-raised text-label text-porter-green-400 sm:min-w-[auto] sm:gap-2 sm:px-2 sm:pr-3"
            aria-expanded={userOpen}
            onClick={() => {
              setUserOpen((o) => !o);
              setNotifOpen(false);
            }}
            aria-label="Account menu"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-porter-bg-surface text-xs font-bold">
              {initials}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-porter-text-muted sm:block" />
          </button>
          {userOpen && (
            <div className="absolute right-0 top-full z-50 mt-space-2 w-48 rounded-xl border border-porter-bg-border bg-porter-bg-raised py-space-1 shadow-modal">
              <Link
                href="/dashboard/settings/"
                className="flex min-h-11 items-center gap-space-2 px-space-3 text-sm text-porter-text-primary hover:bg-porter-bg-surface"
                onClick={() => setUserOpen(false)}
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <button
                type="button"
                className="flex w-full min-h-11 items-center gap-space-2 px-space-3 text-left text-sm text-porter-text-secondary hover:bg-porter-bg-surface hover:text-porter-orange-500"
                onClick={() => {
                  setUserOpen(false);
                  onLogout();
                }}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="hidden w-10 lg:block" aria-hidden />
    </header>
  );
}
