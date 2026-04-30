"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function MarketingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-base ${
        scrolled ? "border-porter-bg-border bg-porter-bg-base/90 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <a href="/" className="font-display text-2xl tracking-wide text-porter-green-500 md:text-3xl">
          PORTER
        </a>
        <nav className="hidden items-center gap-8 text-sm font-medium text-porter-text-secondary md:flex">
          <a href="#how" className="transition-colors hover:text-porter-text-primary">
            How It Works
          </a>
          <a href="#pricing" className="transition-colors hover:text-porter-text-primary">
            Pricing
          </a>
          <a href="#demo" className="transition-colors hover:text-porter-text-primary">
            Demo
          </a>
        </nav>
        <Link
          href="/auth/signup"
          className="hidden min-h-11 items-center justify-center rounded-lg bg-porter-green-500 px-4 text-sm font-semibold text-porter-bg-base shadow-card transition-colors hover:bg-porter-green-600 sm:inline-flex"
        >
          Free Trial — No Card
        </Link>
        <Link
          href="/auth/signup"
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-porter-green-500 px-3 text-sm font-semibold text-porter-bg-base shadow-card sm:hidden"
        >
          Start
        </Link>
      </div>
    </header>
  );
}
