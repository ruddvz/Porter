"use client";

import { Card } from "@/components/ui/Card";

export default function AdminSettingsPage() {
  return (
    <Card padding="lg" className="max-w-2xl space-y-space-3 text-body text-porter-text-secondary">
      <p className="text-title text-porter-text-primary">Admin settings</p>
      <p>
        Platform configuration, staff invites, and API keys belong here. Wire to Supabase service role and
        never expose secrets to the browser.
      </p>
    </Card>
  );
}
