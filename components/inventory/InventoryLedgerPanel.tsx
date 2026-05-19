"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import type { Product } from "@/types";
import { useCallback, useEffect, useState } from "react";

type MovementRow = {
  id: string;
  movement_type: string;
  quantity_change: number;
  reason: string | null;
  source: string | null;
  created_at: string;
  products?: { name: string } | null;
};

export default function InventoryLedgerPanel({
  products,
  onStockChanged,
}: {
  products: Product[];
  onStockChanged: () => void;
}) {
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustProductId, setAdjustProductId] = useState("");
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/seller/inventory/movements?limit=40");
    const json = (await res.json()) as { data?: MovementRow[] };
    setMovements(json.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitAdjust() {
    const qty = parseFloat(adjustQty);
    if (!adjustProductId || !Number.isFinite(qty) || qty === 0) return;
    setBusy(true);
    const res = await fetch("/api/seller/inventory/adjust", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: adjustProductId,
        quantityChange: qty,
        reason: adjustReason || undefined,
      }),
    });
    setBusy(false);
    if (res.ok) {
      setAdjustOpen(false);
      setAdjustQty("");
      setAdjustReason("");
      void load();
      onStockChanged();
    }
  }

  return (
    <Card padding="md" className="mt-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-title text-porter-text-primary">Stock ledger</h2>
          <p className="text-xs text-porter-text-muted">Every change is recorded — sales, restocks, reservations.</p>
        </div>
        <Button type="button" size="sm" onClick={() => setAdjustOpen(true)}>
          + Adjust stock
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-porter-text-muted">Loading movements…</p>
      ) : movements.length === 0 ? (
        <p className="text-sm text-porter-text-muted">No movements yet. Adjust stock or receive an order.</p>
      ) : (
        <ul className="max-h-80 space-y-2 overflow-y-auto">
          {movements.map((m) => (
            <li
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-porter-bg-border px-3 py-2 text-sm"
            >
              <span className="font-medium text-porter-text-primary">{m.products?.name ?? "Product"}</span>
              <span className="font-mono text-porter-text-secondary">{m.movement_type}</span>
              <span className={m.quantity_change >= 0 ? "text-porter-green-400" : "text-porter-orange-500"}>
                {m.quantity_change >= 0 ? "+" : ""}
                {m.quantity_change}
              </span>
              <span className="text-xs text-porter-text-muted">
                {new Date(m.created_at).toLocaleString()}
                {m.source ? ` · ${m.source}` : ""}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Modal open={adjustOpen} onClose={() => setAdjustOpen(false)} title="Adjust stock">
        <div className="space-y-3">
          <label className="block text-sm text-porter-text-secondary">
            Product
            <select
              className="mt-1 w-full rounded-lg border border-porter-bg-border bg-porter-bg-surface px-3 py-2"
              value={adjustProductId}
              onChange={(e) => setAdjustProductId(e.target.value)}
            >
              <option value="">Select…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.stock_quantity ?? 0} on hand)
                </option>
              ))}
            </select>
          </label>
          <Input.Text
            id="adj-qty"
            label="Quantity change (+ receive, − remove)"
            type="number"
            value={adjustQty}
            onChange={(e) => setAdjustQty(e.target.value)}
            placeholder="e.g. 10 or -2"
          />
          <Input.Text id="adj-reason" label="Reason (optional)" value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
          <Button type="button" loading={busy} onClick={() => void submitAdjust()}>
            Save movement
          </Button>
        </div>
      </Modal>
    </Card>
  );
}
