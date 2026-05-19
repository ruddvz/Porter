"use client";

import type { SetupCheckItem } from "@/lib/setup-checklist";
import { setupProgress } from "@/lib/setup-checklist";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

export default function SetupChecklistCard({
  items,
  onContinueSetup,
}: {
  items: SetupCheckItem[];
  onContinueSetup?: () => void;
}) {
  const pct = setupProgress(items);
  const allDone = pct === 100;
  if (allDone) return null;

  const next = items.find((i) => !i.done);

  return (
    <Card padding="md" className="border-porter-green-500/25 bg-porter-green-500/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-title text-porter-text-primary">Launch your store</h2>
          <p className="mt-1 text-sm text-porter-text-secondary">{pct}% complete — finish setup to start taking orders.</p>
        </div>
        {next?.href ? (
          <Button type="button" size="sm" onClick={onContinueSetup}>
            <Link href={next.href}>Continue setup</Link>
          </Button>
        ) : null}
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            {item.done ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-porter-green-400" aria-hidden />
            ) : (
              <Circle className="h-4 w-4 shrink-0 text-porter-text-muted" aria-hidden />
            )}
            {item.href && !item.done ? (
              <Link href={item.href} className="text-porter-text-primary hover:text-porter-green-400 hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className={item.done ? "text-porter-text-muted line-through" : "text-porter-text-primary"}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}
