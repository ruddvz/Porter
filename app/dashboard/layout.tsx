"use client";

import { ShopShell } from "@/components/dashboard/ShopShell";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ShopShell>{children}</ShopShell>;
}
