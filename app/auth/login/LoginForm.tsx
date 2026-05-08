"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { GoogleOAuthButton } from "@/components/auth/GoogleOAuthButton";
import { isGoogleAuthEnabled } from "@/lib/auth-config";
import { safeAuthNextPath } from "@/lib/auth-redirect";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/** Email/password login for sellers. */
export default function LoginForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const search = useSearchParams();
  const next = safeAuthNextPath(search.get("next"), "/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const oauthFailed = search.get("error") === "oauth";
  const showGoogle = isGoogleAuthEnabled();

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
    <AuthShell subtitle="Seller login">
      <Card padding="lg" className="mx-auto w-full max-w-md border-porter-bg-border shadow-modal">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          <div>
            <h1 className="text-heading text-porter-text-primary">Sign in</h1>
            <p className="mt-1 text-sm text-porter-text-muted">Use the email and password for your Porter seller account.</p>
          </div>
          <Input.Text
            id="login-email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input.Text
            id="login-password"
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? (
            <p className="text-sm font-medium text-porter-orange-500" role="alert">
              {error}
            </p>
          ) : null}
          {oauthFailed ? (
            <p className="text-sm font-medium text-porter-orange-500" role="alert">
              Google sign-in did not complete. Try again or use email and password.
            </p>
          ) : null}
          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm text-porter-green-400 underline-offset-2 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Sign in
          </Button>
          {showGoogle ? (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center" aria-hidden>
                  <span className="w-full border-t border-porter-bg-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-porter-bg-surface px-2 text-porter-text-muted">Or</span>
                </div>
              </div>
              <GoogleOAuthButton nextPath={next} label="Continue with Google" />
            </>
          ) : null}
        </form>
        <p className="mt-6 text-center text-sm text-porter-text-muted">
          New here?{" "}
          <Link href="/auth/signup" className="font-medium text-porter-green-400 underline-offset-2 hover:underline">
            Create account
          </Link>
        </p>
      </Card>
    </AuthShell>
  );
}
