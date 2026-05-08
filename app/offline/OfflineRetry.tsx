"use client";

import { Button } from "@/components/ui/Button";

export function OfflineRetry() {
  return (
    <Button type="button" variant="primary" className="min-w-40" onClick={() => window.location.reload()}>
      Retry
    </Button>
  );
}
