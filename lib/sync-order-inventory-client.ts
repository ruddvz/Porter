/** Client-side helper after order status changes in dashboard. */
export async function syncOrderInventory(
  orderId: string,
  previousStatus: string,
  newStatus: string
): Promise<void> {
  if (previousStatus === newStatus) return;
  if (newStatus !== "cancelled" && newStatus !== "delivered") return;
  try {
    await fetch(`/api/seller/orders/${orderId}/inventory-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ previousStatus, newStatus }),
    });
  } catch {
    /* non-blocking */
  }
}
