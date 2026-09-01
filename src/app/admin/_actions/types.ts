/** Shared shape for every admin form action. */
export type ActionState = {
  status: "idle" | "ok" | "error";
  message?: string;
  /** Field-level messages, keyed by form field name. */
  errors?: Record<string, string>;
};

export const idle: ActionState = { status: "idle" };

export function fail(message: string, errors?: Record<string, string>): ActionState {
  return { status: "error", message, errors };
}

export function ok(message: string): ActionState {
  return { status: "ok", message };
}

/** Turns a ZodError into the flat field map the forms render. */
export function fieldErrors(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form");
    errors[key] ??= issue.message;
  }
  return errors;
}
