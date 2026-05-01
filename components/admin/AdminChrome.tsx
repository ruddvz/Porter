"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopBar from "@/components/admin/AdminTopBar";

export default function AdminChrome({ email, children }: { email: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="min-h-screen flex-1 lg:pl-60">
        <AdminTopBar email={email} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
