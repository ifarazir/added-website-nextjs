"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { changePassword } from "@/app/admin/_actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-parts";
import { useFormAction } from "@/components/admin/use-form-action";
import { Input } from "@/components/ui/input";

export function PasswordForm() {
  const { state, onSubmit, pending } = useFormAction(changePassword);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "ok") {
      toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-5">
      <Field label="Current password" htmlFor="current" error={state.errors?.current}>
        <Input id="current" name="current" type="password" autoComplete="current-password" required />
      </Field>
      <Field label="New password" htmlFor="next" error={state.errors?.next}>
        <Input id="next" name="next" type="password" autoComplete="new-password" required />
      </Field>
      <Field label="Confirm new password" htmlFor="confirm" error={state.errors?.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      </Field>

      <FormMessage state={state} />
      <SubmitButton pending={pending} className="w-fit">Change password</SubmitButton>
    </form>
  );
}
