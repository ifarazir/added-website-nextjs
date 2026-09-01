"use client";

import { startTransition, useActionState } from "react";

import { idle, type ActionState } from "@/app/admin/_actions/types";

type Action = (prev: ActionState, formData: FormData) => Promise<ActionState>;

/**
 * Runs a server action from a submit handler rather than from `<form action>`.
 *
 * React 19 resets a form's uncontrolled fields once its `action` resolves,
 * which is right for a "post and clear" form but wrong for an editor: a failed
 * validation would throw away everything that was typed. Dispatching the action
 * ourselves keeps the DOM values intact, and the returned `pending` replaces
 * what `useFormStatus` would have given us.
 */
export function useFormAction(action: Action, initial: ActionState = idle) {
  const [state, dispatch, pending] = useActionState(action, initial);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, onSubmit, pending };
}
