"use client";

import { cn } from "@/lib/utils";
import { ChevronDown, Search } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";

type BaseField = {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  containerClassName?: string;
};

type TextLikeProps = BaseField &
  Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
    variant?: "text" | "number" | "search";
    leftSlot?: ReactNode;
  };

type TextareaFieldProps = BaseField &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    variant: "textarea";
  };

type SelectOption = { value: string; label: string };

type SelectFieldProps = BaseField &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
    variant: "select";
    options: SelectOption[];
    placeholderOption?: string;
  };

export type InputFieldProps = TextLikeProps | TextareaFieldProps | SelectFieldProps;

const fieldShell =
  "w-full min-h-11 rounded-md border bg-porter-bg-raised px-space-3 py-space-2 text-body text-porter-text-primary font-sans transition-[border-color,box-shadow] duration-[150ms] placeholder:text-porter-text-muted focus:outline-none focus:border-porter-green-500 focus:ring-2 focus:ring-porter-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed";

export function Input(props: InputFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  if (props.variant === "textarea") {
    const { label, error, hint, className, containerClassName, variant, ...ta } = props;
    void variant;
    return (
      <div className={cn("flex flex-col gap-space-1", containerClassName)}>
        <label htmlFor={id} className="text-label text-porter-text-secondary">
          {label}
        </label>
        <textarea
          id={id}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? `${id}-hint` : undefined}
          className={cn(
            fieldShell,
            "min-h-[120px] resize-y",
            error && "border-porter-orange-500 focus:border-porter-orange-500 focus:ring-porter-orange-500/20",
            className
          )}
          {...ta}
        />
        {hint && !error && (
          <p id={`${id}-hint`} className="text-xs text-porter-text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-porter-orange-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (props.variant === "select") {
    const {
      label,
      error,
      hint,
      className,
      containerClassName,
      options,
      placeholderOption,
      variant,
      ...sel
    } = props;
    void variant;
    return (
      <div className={cn("flex flex-col gap-space-1", containerClassName)}>
        <label htmlFor={id} className="text-label text-porter-text-secondary">
          {label}
        </label>
        <div className="relative">
          <select
            id={id}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : hint ? `${id}-hint` : undefined}
            className={cn(
              fieldShell,
              "appearance-none pr-10 cursor-pointer",
              error && "border-porter-orange-500 focus:border-porter-orange-500 focus:ring-porter-orange-500/20",
              className
            )}
            {...sel}
          >
            {placeholderOption !== undefined && (
              <option value="">{placeholderOption}</option>
            )}
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-porter-text-muted"
            aria-hidden
          />
        </div>
        {hint && !error && (
          <p id={`${id}-hint`} className="text-xs text-porter-text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-xs text-porter-orange-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  const {
    label,
    error,
    hint,
    className,
    containerClassName,
    variant = "text",
    leftSlot,
    type,
    ...inp
  } = props as TextLikeProps;

  const inputType =
    variant === "number" ? "number" : variant === "search" ? "search" : type ?? "text";

  const showSearchIcon = variant === "search" && !leftSlot;

  return (
    <div className={cn("flex flex-col gap-space-1", containerClassName)}>
      <label htmlFor={id} className="text-label text-porter-text-secondary">
        {label}
      </label>
      <div className="relative flex items-center">
        {(leftSlot || showSearchIcon) && (
          <span className="pointer-events-none absolute left-3 flex text-porter-text-muted">
            {leftSlot ?? <Search className="h-4 w-4" aria-hidden />}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? `${id}-hint` : undefined}
          className={cn(
            fieldShell,
            Boolean(leftSlot || showSearchIcon) && "pl-10",
            error && "border-porter-orange-500 focus:border-porter-orange-500 focus:ring-porter-orange-500/20",
            className
          )}
          {...inp}
        />
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-porter-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-porter-orange-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
