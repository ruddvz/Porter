"use client";

import { MOCK_SELLERS } from "@/lib/admin-mock";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { Button } from "@/components/ui/Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

function ImpersonationBannerInner() {
  const search = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { session } = useAdminAuth();

  const sellerId = search.get("impersonate");
  const seller = useMemo(
    () => (sellerId ? MOCK_SELLERS.find((s) => s.id === sellerId) : undefined),
    [sellerId]
  );

  if (!session || !sellerId || !seller) return null;

  const exit = () => {
    router.replace(pathname || "/dashboard/");
  };

  return (
    <div className="flex shrink-0 items-center justify-between gap-space-3 border-b border-red-600/40 bg-red-950/50 px-space-4 py-space-3">
      <p className="text-sm font-semibold text-red-200">
        You are viewing as <span className="text-porter-text-primary">{seller.storeName}</span> (impersonate demo)
      </p>
      <Button type="button" variant="secondary" size="sm" onClick={exit}>
        Exit
      </Button>
    </div>
  );
}

export function ImpersonationBanner() {
  return (
    <Suspense fallback={null}>
      <ImpersonationBannerInner />
    </Suspense>
  );
}
