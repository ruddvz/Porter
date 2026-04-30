"use client";

import { ImpersonationBanner } from "@/components/dashboard/ImpersonationBanner";
import { ShopShell } from "@/components/dashboard/ShopShell";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ShopShell>
      <ImpersonationBanner />
      {children}
    </ShopShell>
  );
}
