"use client";

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
    <main id="main-content" className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <h1 className="font-['Bebas_Neue',sans-serif] text-5xl tracking-wide text-[#25D366]">PORTER</h1>
      <p className="mt-2 text-sm text-white/70">Start your 14-day free trial</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-white/10 bg-[#111A14] p-6">
        <label className="block text-sm">
          <span className="text-white/80">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none ring-[#25D366] focus:ring-2"
          />
        </label>
        <label className="block text-sm">
          <span className="text-white/80">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none ring-[#25D366] focus:ring-2"
          />
        </label>
        {error && <p className="text-sm text-[#FF6B35]">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#25D366] py-2.5 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-[#25D366] underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
