"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";

const DISMISS_KEY = "porter_install_prompt_dismissed";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<Event | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!visible) return null;

  async function install() {
    if (!deferred) return;
    await (deferred as unknown as { prompt: () => Promise<void> }).prompt();
    setVisible(false);
    setDeferred(null);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <div className="fixed bottom-4 left-3 right-3 z-50 md:left-auto md:right-6 md:max-w-md">
      <Card padding="md" className="border-porter-green-500/30 shadow-modal">
        <p className="text-title text-porter-text-primary">Install Porter</p>
        <p className="mt-2 text-sm text-porter-text-secondary">Add to your home screen for faster access to orders.</p>
        <p className="mt-2 text-xs text-porter-text-muted">
          iOS: Safari → Share → <strong>Add to Home Screen</strong>
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {deferred && (
            <Button type="button" size="sm" onClick={() => void install()}>
              Install
            </Button>
          )}
          <Button type="button" size="sm" variant="ghost" onClick={dismiss}>
            Dismiss
          </Button>
        </div>
      </Card>
    </div>
  );
}
