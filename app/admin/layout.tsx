"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { session } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const isLogin = pathname?.includes("/admin/login");
    if (!session && !isLogin) {
      router.replace("/admin/login/");
    }
  }, [session, pathname, router]);

  if (!session && !pathname?.includes("/admin/login")) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-porter-bg-base text-porter-text-secondary">
        Redirecting…
      </div>
    );
  }

  if (pathname?.includes("/admin/login")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen min-h-[100dvh] bg-porter-bg-base">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 overflow-auto p-space-4 sm:p-space-6">{children}</main>
      </div>
    </div>
  );
}
