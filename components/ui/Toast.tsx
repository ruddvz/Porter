"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
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
  push: (type: ToastType, message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const typeStyles: Record<ToastType, string> = {
  success: "border-porter-green-500/40 bg-porter-bg-raised text-porter-text-primary",
  error: "border-porter-status-cancelled/50 bg-porter-bg-raised text-porter-text-primary",
  info: "border-porter-status-dispatched/40 bg-porter-bg-raised text-porter-text-primary",
  warning: "border-porter-status-cod/50 bg-porter-bg-raised text-porter-text-primary",
};

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 shrink-0 text-porter-green-500" aria-hidden />,
  error: <XCircle className="h-5 w-5 shrink-0 text-porter-status-cancelled" aria-hidden />,
  info: <Info className="h-5 w-5 shrink-0 text-porter-status-dispatched" aria-hidden />,
  warning: <AlertTriangle className="h-5 w-5 shrink-0 text-porter-status-cod" aria-hidden />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timers.current.get(id);
    if (t) clearTimeout(t);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now());
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => remove(id), 4000);
      timers.current.set(id, timer);
    },
    [remove]
  );

  useEffect(() => {
    const timerMap = timers.current;
    return () => {
      timerMap.forEach((t) => clearTimeout(t));
      timerMap.clear();
    };
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className={cn(
          "pointer-events-none fixed z-[100] flex max-h-[50vh] w-full flex-col gap-space-2 p-space-4",
          "bottom-0 left-0 items-center justify-end sm:bottom-space-4 sm:right-space-4 sm:left-auto sm:items-end sm:max-w-sm"
        )}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-md min-h-11 items-start gap-space-3 rounded-lg border px-space-4 py-space-3 shadow-raised",
              "animate-toast-in",
              typeStyles[t.type]
            )}
            role="status"
          >
            {icons[t.type]}
            <p className="flex-1 text-body text-porter-text-primary">{t.message}</p>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-md text-porter-text-muted hover:bg-porter-bg-surface hover:text-porter-text-primary"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
