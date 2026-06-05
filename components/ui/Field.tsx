import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type FieldProps = {
  label: string;
  htmlFor?: string;
  helper?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export function Field({ label, htmlFor, helper, error, children, className }: FieldProps) {
  const errorId = error ? `${htmlFor ?? label}-error` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-[13px] font-semibold text-porter-text-primary">
        {label}
      </label>
      {children}
      {helper && !error ? <p className="text-[13px] text-porter-text-muted">{helper}</p> : null}
      {error ? (
        <p id={errorId} className="text-[13px] text-porter-orange-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
