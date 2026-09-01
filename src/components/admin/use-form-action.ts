"use client";

import { useState, useTransition } from "react";

import { idle, type ActionState } from "@/app/admin/_actions/types";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Runs a server action from a submit handler and keeps its result.
 *
 * `useActionState` is deliberately not used here. Bound to a form's `action`
 * prop it resets every uncontrolled field once the action resolves — which
 * throws away everything typed whenever a save comes back with a validation
 * error — and in the dialogs it intermittently left `pending` stuck true after
 * the action had already returned, so the dialog never closed and the save
 * appeared to hang.
 *
 * Calling the action as a plain async function inside a transition avoids both:
 * nothing touches the form's DOM, and `redirect()` still works because the call
 * happens inside a transition.
 */
export function useFormAction(action: Action, initial: ActionState = idle) {
  const [state, setState] = useState<ActionState>(initial);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        setState(await action(state, formData));
      } catch (error) {
        // A redirect is thrown, not returned — let Next handle it.
        if (isRedirect(error)) throw error;

        console.error(error);
        setState({ status: "error", message: "Something went wrong. Please try again." });
      }
    });
  }

  return { state, pending, formProps: { onSubmit } };
}

function isRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}
