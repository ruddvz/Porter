"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
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
    <AuthShell subtitle="Start your store">
      <Card padding="lg" className="mx-auto w-full max-w-md border-porter-bg-border shadow-modal">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          <div>
            <h1 className="text-heading text-porter-text-primary">Create account</h1>
            <p className="mt-1 text-sm text-porter-text-muted">14-day trial — then pick Starter or Growth in settings.</p>
          </div>
          <Input.Text
            id="signup-email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input.Text
            id="signup-password"
            label="Password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? (
            <p className="text-sm font-medium text-porter-orange-500" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-porter-text-muted">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-porter-green-400 underline-offset-2 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
