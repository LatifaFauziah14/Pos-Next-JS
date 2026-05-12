"use client";

import { forwardRef, useId } from "react";
import DOMPurify from "dompurify";
import clsx from "clsx";

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    onChange,
    className,
    id: givenId,
    sanitize = true,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const id = givenId || generatedId;

  function handleChange(event) {
    const rawValue = event.target.value;
    const cleanValue = sanitize ? DOMPurify.sanitize(rawValue) : rawValue;
    event.target.value = cleanValue;
    onChange?.(event);
  }

  return (
    <label className="grid gap-2 text-sm font-medium text-foreground" htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <input
        ref={ref}
        id={id}
        className={clsx(
          "h-12 rounded-2xl border border-border bg-white px-4 text-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-[var(--ring)]",
          error && "border-danger focus:border-danger",
          className,
        )}
        onChange={handleChange}
        {...props}
      />
      {error ? <span className="text-xs text-danger">{error}</span> : null}
      {!error && helperText ? (
        <span className="text-xs text-muted">{helperText}</span>
      ) : null}
    </label>
  );
});
