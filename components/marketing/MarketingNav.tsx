"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { id: "how", label: "How It Works" },
  { id: "pricing", label: "Pricing" },
  { id: "demo", label: "Demo" },
] as const;

export function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-transparent transition-[background,border-color,backdrop-filter] duration-300",
        scrolled && "border-porter-bg-border bg-porter-bg-base/80 backdrop-blur-md"
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-space-4 px-space-4 sm:px-space-6">
        <Link href="/" className="font-display text-2xl tracking-wide text-porter-green-500">
          PORTER
        </Link>
        <nav className="hidden items-center gap-space-6 md:flex" aria-label="Marketing">
          {links.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => scrollTo(l.id)}
              className="text-sm font-medium text-porter-text-secondary transition-colors hover:text-porter-text-primary"
            >
              {l.label}
            </button>
          ))}
        </nav>
        <Button href="/auth/signup/" variant="primary" size="sm" className="shrink-0">
          Free Trial — No Card
        </Button>
      </div>
    </header>
  );
}
