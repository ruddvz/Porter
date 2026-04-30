import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
          <p className="text-white/50">Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
