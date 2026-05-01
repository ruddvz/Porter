"use client";

export default function ImpersonateButton({ sellerId }: { sellerId: string }) {
  return (
    <button
      type="button"
      className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-porter-status-cancelled px-4 text-sm font-semibold text-white hover:brightness-110"
      onClick={async () => {
        const res = await fetch("/api/admin/impersonate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sellerId }),
        });
        if (!res.ok) return;
        window.location.href = "/dashboard";
      }}
    >
      View as seller
    </button>
  );
}
