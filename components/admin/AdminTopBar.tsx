"use client";

import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminTopBar({ email }: { email: string }) {
  const router = useRouter();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-porter-bg-border bg-porter-bg-base/95 px-4 backdrop-blur">
      <div>
        <p className="font-display text-lg tracking-wide text-porter-status-cancelled">PORTER ADMIN</p>
        <p className="text-xs text-porter-text-muted">Internal operations</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm text-porter-text-secondary sm:inline">{email}</span>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={async () => {
            const { createSupabaseBrowserClient } = await import("@/lib/supabase");
            const supabase = createSupabaseBrowserClient();
            await supabase.auth.signOut();
            router.push("/admin/login");
            router.refresh();
          }}
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </header>
  );
}
