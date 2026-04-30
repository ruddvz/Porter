"use client";

import { useAdminAuth } from "@/lib/admin-auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function AdminLoginPage() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const ok = login(email, password);
    if (!ok) {
      setError("Enter email and password.");
      return;
    }
    router.replace("/admin/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-porter-bg-base px-space-4 py-space-10">
      <div className="w-full max-w-md space-y-space-6 rounded-2xl border border-porter-bg-border bg-porter-bg-surface p-space-8 shadow-raised">
        <div>
          <p className="font-display text-3xl tracking-wide text-porter-green-500">PORTER</p>
          <p className="mt-space-1 text-sm font-semibold uppercase tracking-wider text-red-400">Admin sign in</p>
          <p className="mt-space-2 text-body text-porter-text-muted">
            Demo: any password works. Production must verify <code className="text-mono text-porter-text-secondary">admin_users</code> via a secure API.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-space-4">
          <Input label="Email" variant="text" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            label="Password"
            variant="text"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error || undefined}
          />
          <Button type="submit" variant="primary" className="w-full">
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}
