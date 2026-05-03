"use client";

import { cn } from "@/lib/utils";

/** Message d’erreur sous un champ (accessibilité + tokens). */
export function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string;
}) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-destructive dark:text-red-300" role="alert">
      {message}
    </p>
  );
}

function inputBorderRing(hasError: boolean) {
  return hasError
    ? "border-destructive focus:border-destructive focus:ring-destructive/25"
    : "border-input focus:border-ring focus:ring-ring/25";
}

export function fieldInputClass(
  hasError: boolean,
  disabled: boolean,
  opts?: { hasLeftIcon?: boolean },
): string {
  const pad = opts?.hasLeftIcon ? "py-3 pl-12 pr-4" : "px-3 py-2.5 sm:px-4";
  return cn(
    "w-full min-h-[48px] rounded-xl border bg-background text-base text-foreground outline-none transition-all placeholder:text-muted-foreground sm:min-h-[44px] sm:text-sm",
    pad,
    inputBorderRing(hasError),
    "focus:ring-2",
    disabled && "pointer-events-none opacity-60",
  );
}

export function fieldTextareaClass(hasError: boolean, disabled: boolean): string {
  return cn(
    "min-h-[88px] w-full resize-y rounded-xl border bg-background px-3 py-2.5 text-base text-foreground outline-none transition-all placeholder:text-muted-foreground sm:text-sm",
    inputBorderRing(hasError),
    "focus:ring-2",
    disabled && "pointer-events-none opacity-60",
  );
}
