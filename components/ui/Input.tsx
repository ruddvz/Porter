import { cn } from "@/lib/cn";
import { Search } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

type TextFieldProps = BaseFieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    inputVariant?: "text" | "number" | "search";
  };

function fieldShell({
  disabled,
  error,
  children,
}: {
  disabled?: boolean;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 w-full items-center gap-2 rounded-lg border bg-porter-bg-raised px-3 py-2 font-sans text-body text-porter-text-primary transition-[box-shadow,border-color] duration-fast",
        "border-porter-bg-border focus-within:border-porter-green-500 focus-within:shadow-[0_0_0_3px_rgba(37,211,102,0.15)]",
        error && "border-porter-orange-500 focus-within:border-porter-orange-500 focus-within:shadow-[0_0_0_3px_rgba(255,107,53,0.12)]",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {children}
    </div>
  );
}

export function InputText(props: TextFieldProps) {
  const { id, label, hint, error, className, inputVariant = "text", disabled, ...inputProps } = props;
  const isSearch = inputVariant === "search";

  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="mb-1.5 block text-label text-porter-text-secondary">
        {label}
      </label>
      {fieldShell({ disabled, error: !!error, children: (
        <>
          {isSearch && <Search className="h-4 w-4 shrink-0 text-porter-text-muted" aria-hidden />}
          <input
            id={id}
            disabled={disabled}
            className="min-h-9 w-full bg-transparent text-body text-porter-text-primary outline-none placeholder:text-porter-text-muted"
            {...inputProps}
            type={inputVariant === "number" ? "number" : inputVariant === "search" ? "search" : inputProps.type ?? "text"}
          />
        </>
      )})}
      {hint && !error && <p className="mt-1 text-xs text-porter-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-porter-orange-500">{error}</p>}
    </div>
  );
}

export type InputSelectProps = BaseFieldProps &
  SelectHTMLAttributes<HTMLSelectElement> & {
    children: ReactNode;
  };

export function InputSelect({ id, label, hint, error, className, disabled, children, ...sel }: InputSelectProps) {
  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="mb-1.5 block text-label text-porter-text-secondary">
        {label}
      </label>
      {fieldShell({
        disabled,
        error: !!error,
        children: (
          <select
            id={id}
            disabled={disabled}
            className="min-h-9 w-full cursor-pointer bg-transparent text-body text-porter-text-primary outline-none"
            {...sel}
          >
            {children}
          </select>
        ),
      })}
      {hint && !error && <p className="mt-1 text-xs text-porter-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-porter-orange-500">{error}</p>}
    </div>
  );
}

export type InputTextareaProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function InputTextarea({ id, label, hint, error, className, disabled, ...ta }: InputTextareaProps) {
  return (
    <div className={cn("w-full", className)}>
      <label htmlFor={id} className="mb-1.5 block text-label text-porter-text-secondary">
        {label}
      </label>
      <div
        className={cn(
          "rounded-lg border bg-porter-bg-raised p-3 transition-[box-shadow,border-color] duration-fast",
          "border-porter-bg-border focus-within:border-porter-green-500 focus-within:shadow-[0_0_0_3px_rgba(37,211,102,0.15)]",
          error && "border-porter-orange-500 focus-within:border-porter-orange-500 focus-within:shadow-[0_0_0_3px_rgba(255,107,53,0.12)]",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <textarea
          id={id}
          disabled={disabled}
          className="min-h-[120px] w-full resize-y bg-transparent text-body text-porter-text-primary outline-none placeholder:text-porter-text-muted"
          {...ta}
        />
      </div>
      {hint && !error && <p className="mt-1 text-xs text-porter-text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs font-medium text-porter-orange-500">{error}</p>}
    </div>
  );
}

/** Unified Input export — use subcomponents for clarity */
export const Input = {
  Text: InputText,
  Select: InputSelect,
  Textarea: InputTextarea,
};
