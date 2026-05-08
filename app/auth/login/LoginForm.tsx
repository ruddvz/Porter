"use client";

import { AuthSplitShell } from "@/components/auth/AuthSplitShell";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

/** Email/password + Google OAuth + forgot password (seller). */
export default function LoginForm() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/dashboard";
  const { push: toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onBlurEmail = useCallback(() => {
    if (!email.trim()) setEmailError("Email is required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setEmailError("Enter a valid email");
    else setEmailError(null);
  }, [email]);

  const onBlurPassword = useCallback(() => {
    if (!password) setPasswordError("Password is required");
    else setPasswordError(null);
  }, [password]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    onBlurEmail();
    onBlurPassword();
    if (!email.trim() || !password || emailError || passwordError) return;
    setLoading(true);
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (err) {
      const msg = err.message.toLowerCase();
      if (msg.includes("confirm")) setError("Please confirm your email before signing in.");
      else if (msg.includes("network")) setError("Network error. Try again.");
      else setError(err.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function signInGoogle() {
    setGoogleLoading(true);
    setError(null);
    const origin = window.location.origin;
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setGoogleLoading(false);
    if (err) setError(err.message);
  }

  async function forgotPassword() {
    if (!email.trim()) {
      toast("Enter your email above first.", "info");
      return;
    }
    const origin = window.location.origin;
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    });
    if (err) toast(err.message, "error");
    else toast("Check your inbox for a reset link.", "success");
  }

  return (
    <AuthSplitShell
      title="WhatsApp commerce for local shops"
      subtitle="Sign in to manage orders, inventory, and payouts."
    >
      <div className="mx-auto w-full max-w-md">
        <h1 className="font-mono text-2xl text-[--text-primary]">Welcome back</h1>
        <p className="mt-1 text-sm text-[--text-secondary]">Seller login</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="input-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
              }}
              onBlur={onBlurEmail}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-err" : undefined}
              className={`input min-h-[44px] ${emailError ? "border-[--danger]" : ""}`}
            />
            {emailError && (
              <p id="email-err" className="mt-1 text-xs text-[--danger]" role="alert">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="input-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
              }}
              onBlur={onBlurPassword}
              aria-invalid={!!passwordError}
              aria-describedby={passwordError ? "pw-err" : undefined}
              className={`input min-h-[44px] ${passwordError ? "border-[--danger]" : ""}`}
            />
            {passwordError && (
              <p id="pw-err" className="mt-1 text-xs text-[--danger]" role="alert">
                {passwordError}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => void forgotPassword()}
            className="text-mono text-xs text-[--accent] hover:underline"
          >
            Forgot password?
          </button>

          {error && (
            <p className="rounded-[var(--radius-sm)] border border-[--danger]/30 bg-[--danger]/10 px-3 py-2 text-sm text-[--danger]" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" size="lg" className="h-12 w-full font-mono" disabled={loading} loading={loading}>
            Sign in
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-[--border]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[--bg-base] px-3 font-mono text-[10px] uppercase tracking-wider text-[--text-muted]">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="h-12 w-full border-[--border] font-mono"
          disabled={googleLoading}
          loading={googleLoading}
          onClick={() => void signInGoogle()}
        >
          Google
        </Button>

        <p className="mt-8 text-center text-sm text-[--text-secondary]">
          New here?{" "}
          <Link href="/auth/signup" className="font-mono text-[--accent] hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </AuthSplitShell>
  );
}
