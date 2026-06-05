import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPageShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-porter-bg-base px-4 py-8 safe-top safe-bottom">
      <div className="mx-auto max-w-[760px]">
        <Link
          href="/"
          className="sticky top-[calc(env(safe-area-inset-top)+12px)] z-10 inline-flex min-h-11 items-center rounded-[var(--po-radius-pill)] border border-porter-bg-border bg-porter-bg-surface px-4 text-sm font-semibold text-porter-green-600 shadow-card"
        >
          ← Home
        </Link>
        <article className="mt-6 rounded-[var(--po-radius-xl)] border border-porter-bg-border bg-porter-bg-surface p-6 shadow-card md:p-8">
          <h1 className="text-display text-porter-text-primary">{title}</h1>
          <div className="prose-porter mt-6 space-y-4 text-[15px] leading-[1.7] text-porter-text-secondary">{children}</div>
        </article>
      </div>
    </main>
  );
}
