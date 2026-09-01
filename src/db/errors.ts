/**
 * Drizzle wraps driver failures in its own error, so the PostgreSQL error code
 * is not on the object that gets thrown — it sits on `cause`, sometimes a level
 * or two down. Checking only the top level silently missed every duplicate-key
 * conflict, and the actions rethrew instead of reporting a field error.
 */
const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";

function hasCode(error: unknown, code: string, depth = 0): boolean {
  if (depth > 5 || typeof error !== "object" || error === null) return false;

  if ("code" in error && (error as { code?: unknown }).code === code) return true;

  return hasCode((error as { cause?: unknown }).cause, code, depth + 1);
}

export function isUniqueViolation(error: unknown) {
  return hasCode(error, UNIQUE_VIOLATION);
}

export function isForeignKeyViolation(error: unknown) {
  return hasCode(error, FOREIGN_KEY_VIOLATION);
}
