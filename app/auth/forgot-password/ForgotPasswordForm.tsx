"use client";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { useState } from "react";

/** Plan0 §2 — password reset email via Supabase. */
export default function ForgotPasswordForm() {
  const supabase = createSupabaseBrowserClient();
  const { push: toast } = useToast();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const origin =
      typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const redirectTo = origin ? `${origin}/auth/login` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), redirectTo ? { redirectTo } : undefined);
    setLoading(false);
    if (error) {
      toast(error.message, "error");
      return;
    }
    setSent(true);
    toast("Check your email for the reset link.", "success");
  }

  return (
    <AuthShell subtitle="Reset password">
      <Card padding="lg" className="mx-auto w-full max-w-md border-porter-bg-border shadow-modal">
        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-body text-porter-text-secondary">
              If an account exists for <span className="font-medium text-porter-text-primary">{email}</span>, we sent a
              reset link. Check your inbox and spam.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-porter-bg-border bg-transparent px-4 font-sans font-semibold text-porter-text-primary transition-colors hover:bg-porter-bg-raised"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
            <div>
              <h1 className="text-heading text-porter-text-primary">Forgot password?</h1>
              <p className="mt-1 text-sm text-porter-text-muted">We will email you a link to choose a new password.</p>
            </div>
            <Input.Text
              id="forgot-email"
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" className="w-full" loading={loading}>
              Send reset link
            </Button>
            <p className="text-center text-sm text-porter-text-muted">
              <Link href="/auth/login" className="text-porter-green-400 underline-offset-2 hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </Card>
    </AuthShell>
  );
}
