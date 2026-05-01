"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";
import AdminPushPrompt from "@/components/admin/AdminPushPrompt";
import { registerAdminServiceWorker } from "@/lib/registerServiceWorker";
import { useEffect } from "react";

export default function AdminChrome({ email, children }: { email: string; children: React.ReactNode }) {
  useEffect(() => {
    registerAdminServiceWorker();
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="min-h-screen flex-1 lg:pl-60">
        <AdminTopBar email={email} />
        <AdminPushPrompt />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
