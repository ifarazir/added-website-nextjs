"use client";

import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import type { ActionState } from "@/app/admin/_actions/types";

/** Label + control + inline error, the layout every admin field uses. */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export function SubmitButton({
  children = "Save",
  pending,
  ...props
}: React.ComponentProps<typeof Button> & { pending?: boolean }) {
  // Forms driven by useFormAction pass `pending` in; plain `<form action>`
  // forms fall back to the surrounding form status.
  const status = useFormStatus();
  const busy = pending ?? status.pending;

  return (
    <Button type="submit" disabled={busy} {...props}>
      {busy && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}

/** Success / failure banner driven by an action's returned state. */
export function FormMessage({ state }: { state: ActionState }) {
  if (state.status === "idle" || !state.message) return null;

  const isError = state.status === "error";
  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
        isError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-emerald-600/30 bg-emerald-600/5 text-emerald-700",
      )}
    >
      {isError ? (
        <AlertCircle className="size-4 shrink-0" />
      ) : (
        <CheckCircle2 className="size-4 shrink-0" />
      )}
      {state.message}
    </div>
  );
}
