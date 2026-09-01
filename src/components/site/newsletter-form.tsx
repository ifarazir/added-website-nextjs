"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { subscribe, type NewsletterState } from "@/app/actions/newsletter";

const initial: NewsletterState = { status: "idle" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="cursor-pointer text-[10px] font-bold tracking-wider-brand uppercase transition-opacity hover:opacity-60 disabled:opacity-40"
    >
      {pending ? "…" : "Join"}
    </button>
  );
}

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribe, initial);

  return (
    <div className="flex max-w-80 flex-col gap-4.5">
      <span className="text-[10px] font-bold tracking-wider-brand text-ink-40 uppercase">
        Newsletter
      </span>
      <form action={formAction} className="flex gap-3.5 border-b border-ink/25 pb-2.5">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          className="min-w-0 flex-1 bg-transparent text-xs font-light tracking-[0.06em] outline-none placeholder:text-ink/35"
        />
        <SubmitButton />
      </form>
      {state.message && (
        <p
          role="status"
          className={`text-[10px] tracking-wide-brand uppercase ${
            state.status === "error" ? "text-red-600" : "text-ink-45"
          }`}
        >
          {state.message}
        </p>
      )}
    </div>
  );
}
