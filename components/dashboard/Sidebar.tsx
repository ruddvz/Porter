"use client";

import type { Seller } from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar({
  seller,
  pendingOrderCount,
}: {
  seller: Seller;
  pendingOrderCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const items = [
    { href: "/dashboard", label: "Live Orders", icon: "📋" },
    { href: "/dashboard/orders", label: "History", icon: "📜" },
    { href: "/dashboard/inventory", label: "Inventory", icon: "📦" },
    { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-[220px] flex-col border-r border-white/10 bg-[#111A14] md:flex">
        <div className="border-b border-white/10 p-4">
          <p className="font-display text-2xl tracking-wide text-[#25D366]">PORTER</p>
          <p className="mt-1 truncate text-sm font-medium text-white">{seller.store_name}</p>
          <span className="mt-2 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs uppercase text-white/70">
            {seller.plan}
          </span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {items.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                pathname === it.href ? "bg-[#25D366]/20 text-[#25D366]" : "text-white/80 hover:bg-white/5"
              }`}
            >
              <span>{it.icon}</span>
              <span className="flex-1">{it.label}</span>
              {it.href === "/dashboard" && pendingOrderCount > 0 && (
                <span className="min-w-[1.25rem] rounded-full bg-[#FF6B35] px-1.5 py-0.5 text-center text-[10px] font-bold text-black">
                  {pendingOrderCount > 99 ? "99+" : pendingOrderCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={logout}
          className="m-3 rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/5"
        >
          Log out
        </button>
      </aside>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-white/10 bg-[#111A14] md:hidden">
        {items.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className={`relative flex flex-1 flex-col items-center py-2 text-xs ${
              pathname === it.href ? "text-[#25D366]" : "text-white/60"
            }`}
          >
            {it.href === "/dashboard" && pendingOrderCount > 0 && (
              <span className="absolute right-2 top-1 min-w-[1rem] rounded-full bg-[#FF6B35] px-1 text-[9px] font-bold leading-tight text-black">
                {pendingOrderCount > 9 ? "9+" : pendingOrderCount}
              </span>
            )}
            <span className="text-lg">{it.icon}</span>
            {it.label.split(" ")[0]}
          </Link>
        ))}
      </nav>
    </>
  );
}
