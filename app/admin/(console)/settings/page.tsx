import { Card } from "@/components/ui/Card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-heading">Admin settings</h1>
      <Card padding="md">
        <p className="text-body text-porter-text-secondary">Manage admin users via Supabase SQL for now. This page is a placeholder for future internal configuration.</p>
      </Card>
    </div>
  );
}
