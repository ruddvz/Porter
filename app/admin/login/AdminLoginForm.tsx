"use client";

import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function AdminLoginForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="font-display text-5xl tracking-wide text-porter-status-cancelled">PORTER ADMIN</h1>
      <p className="mt-2 text-sm text-porter-text-secondary">Internal access only</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-porter-bg-border bg-porter-bg-surface p-6 shadow-card">
        <label className="block text-sm">
          <span className="text-porter-text-secondary">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 py-2 text-porter-text-primary outline-none focus:ring-2 focus:ring-porter-green-500/40"
          />
        </label>
        <label className="block text-sm">
          <span className="text-porter-text-secondary">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-porter-bg-border bg-porter-bg-raised px-3 py-2 text-porter-text-primary outline-none focus:ring-2 focus:ring-porter-green-500/40"
          />
        </label>
        {error && <p className="text-sm text-porter-orange-500">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-porter-text-muted">
        Seller?{" "}
        <Link href="/auth/login" className="text-porter-green-400 underline">
          Shop login
        </Link>
      </p>
    </main>
  );
}
