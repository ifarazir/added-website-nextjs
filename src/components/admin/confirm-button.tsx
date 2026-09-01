"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { idle, type ActionState } from "@/app/admin/_actions/types";

/**
 * Destructive action behind a confirmation dialog. The action runs through
 * useActionState so the result can be surfaced as a toast.
 */
export function ConfirmButton({
  action,
  id,
  title,
  description,
  label = "Delete",
  confirmLabel = "Delete",
  children,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  id: string;
  title: string;
  description: string;
  label?: string;
  confirmLabel?: string;
  children?: React.ReactNode;
}) {
  const [state, formAction] = useActionState(action, idle);

  useEffect(() => {
    if (state.status === "ok") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
            {label}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <AlertDialogAction type="submit" className="bg-destructive hover:bg-destructive/90">
              {confirmLabel}
            </AlertDialogAction>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
