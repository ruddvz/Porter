import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main id="main-content" className="flex min-h-screen items-center justify-center bg-porter-bg-base px-4 text-porter-text-muted">
          <p>Loading…</p>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
