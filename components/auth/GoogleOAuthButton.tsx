"use client";

import { Button } from "@/components/ui/Button";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useState } from "react";

function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type Props = {
  /** Relative path after successful OAuth (must start with `/`). */
  nextPath: string;
  label?: string;
  className?: string;
};

/** Plan0 §2 — Google OAuth via Supabase when `NEXT_PUBLIC_AUTH_GOOGLE_ENABLED=true`. */
export function GoogleOAuthButton({ nextPath, label = "Continue with Google", className }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const origin = window.location.origin;
    const next = encodeURIComponent(nextPath.startsWith("/") ? nextPath : "/dashboard");
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback?next=${next}` },
    });
    setLoading(false);
    if (err) setError(err.message);
  }

  return (
    <div className={className}>
      <Button type="button" variant="secondary" className="w-full gap-3" loading={loading} onClick={() => void onClick()}>
        <GoogleGlyph className="h-5 w-5 shrink-0" />
        {label}
      </Button>
      {error ? (
        <p className="mt-2 text-sm font-medium text-porter-orange-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
