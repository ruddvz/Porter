"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import type { SellerPlan } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SellerDetailActions({
  sellerId,
  currentPlan,
  isActive,
}: {
  sellerId: string;
  currentPlan: SellerPlan;
  isActive: boolean;
}) {
  const router = useRouter();
  const { push: toast } = useToast();
  const [plan, setPlan] = useState<SellerPlan>(currentPlan);
  const [busy, setBusy] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);

  async function savePlan() {
    setBusy(true);
    const res = await fetch(`/api/admin/sellers/${sellerId}/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast(j.error ?? "Failed to update plan", "error");
      return;
    }
    toast("Plan updated", "success");
    router.refresh();
  }

  async function deactivate() {
    setBusy(true);
    const res = await fetch(`/api/admin/sellers/${sellerId}/deactivate`, { method: "POST" });
    setBusy(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast(j.error ?? "Failed to deactivate", "error");
      return;
    }
    toast("Seller deactivated", "success");
    setDeactivateOpen(false);
    router.refresh();
  }

  return (
    <div id="admin-seller-actions" className="mt-6 space-y-4 border-t border-porter-bg-border pt-4">
      <div>
        <label htmlFor="admin-plan" className="text-label text-porter-text-muted">
          Edit plan
        </label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <select
            id="admin-plan"
            className="min-h-11 rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 text-sm text-porter-text-primary"
            value={plan}
            onChange={(e) => setPlan(e.target.value as SellerPlan)}
            disabled={!isActive}
          >
            <option value="starter">Starter</option>
            <option value="growth">Growth</option>
          </select>
          <Button type="button" size="sm" loading={busy} disabled={plan === currentPlan} onClick={() => void savePlan()}>
            Save plan
          </Button>
        </div>
      </div>
      {isActive && (
        <Button type="button" variant="danger" size="sm" onClick={() => setDeactivateOpen(true)}>
          Deactivate store
        </Button>
      )}

      <Modal
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        title="Deactivate this store?"
        footer={
          <>
            <Button type="button" variant="ghost" onClick={() => setDeactivateOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="danger" loading={busy} onClick={() => void deactivate()}>
              Deactivate
            </Button>
          </>
        }
      >
        <p className="text-body text-porter-text-secondary">The WhatsApp bot will stop responding for this seller until re-enabled in the database.</p>
      </Modal>
    </div>
  );
}
