"use client";

import { cn } from "@/lib/cn";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  push: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

const typeStyles: Record<ToastType, string> = {
  success: "border-porter-green-500/40 bg-porter-bg-raised text-porter-text-primary",
  error: "border-porter-orange-500/50 bg-porter-bg-raised text-porter-text-primary",
  info: "border-porter-status-dispatched/40 bg-porter-bg-raised text-porter-text-primary",
  warning: "border-porter-status-cod/50 bg-porter-bg-raised text-porter-text-primary",
};

function iconFor(type: ToastType) {
  const cls = "h-5 w-5 shrink-0";
  switch (type) {
    case "success":
      return <CheckCircle2 className={cn(cls, "text-porter-green-400")} aria-hidden />;
    case "error":
      return <AlertCircle className={cn(cls, "text-porter-orange-500")} aria-hidden />;
    case "info":
      return <Info className={cn(cls, "text-porter-status-dispatched")} aria-hidden />;
    case "warning":
      return <AlertCircle className={cn(cls, "text-porter-status-cod")} aria-hidden />;
    default:
      return null;
  }
}

function ToastRow({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex min-h-11 max-w-[min(100vw-2rem,420px)] items-start gap-3 rounded-xl border px-4 py-3 shadow-raised transition-[transform,opacity] duration-base ease-out animate-porter-slide-in-right",
        typeStyles[toast.type],
      )}
    >
      {iconFor(toast.type)}
      <p className="min-w-0 flex-1 text-body text-porter-text-primary">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-porter-text-muted hover:bg-porter-bg-surface hover:text-porter-text-primary"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType = "info") => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message }]);
      const handle = setTimeout(() => dismiss(id), 4000);
      timers.current.set(id, handle);
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach((h) => clearTimeout(h));
      pending.clear();
    };
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[200] flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:left-auto sm:right-4 sm:items-end"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastRow key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
