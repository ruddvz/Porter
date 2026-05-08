"use client";

import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Creates Supabase Auth user then redirects to onboarding for store setup. */
export default function SignupPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <AuthSplitShell title="Start selling on WhatsApp today" subtitle="Create your seller account — then add your store details.">
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-mono text-2xl text-[--text-primary]">Create account</h1>
        <p className="mt-1 text-sm text-[--text-secondary]">14-day trial · no card required</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="su-email" className="input-label">
              Email
            </label>
            <input
              id="su-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input min-h-[44px]"
            />
          </div>
          <div>
            <label htmlFor="su-password" className="input-label">
              Password
            </label>
            <input
              id="su-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input min-h-[44px]"
            />
          </div>
          {error && (
            <p className="rounded-[var(--radius-sm)] border border-[--danger]/30 bg-[--danger]/10 px-3 py-2 text-sm text-[--danger]" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" className="h-12 w-full font-mono" disabled={loading} loading={loading}>
            Create account
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-[--text-secondary]">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-mono text-[--accent] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitShell>
  );
}
