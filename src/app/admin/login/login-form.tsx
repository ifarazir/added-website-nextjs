"use client";


import { login } from "@/app/admin/_actions/auth";
import { Field, FormMessage, SubmitButton } from "@/components/admin/form-parts";
import { useFormAction } from "@/components/admin/use-form-action";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function LoginForm({ next }: { next?: string }) {
  const { state, onSubmit, pending } = useFormAction(login);

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <input type="hidden" name="next" value={next ?? "/admin"} />

          <Field label="Email" htmlFor="email" error={state.errors?.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              autoFocus
              aria-invalid={Boolean(state.errors?.email)}
            />
          </Field>

          <Field label="Password" htmlFor="password" error={state.errors?.password}>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(state.errors?.password)}
            />
          </Field>

          <FormMessage state={state} />
          <SubmitButton pending={pending} className="w-full">Sign in</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
