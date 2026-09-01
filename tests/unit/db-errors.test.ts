import { describe, expect, it } from "vitest";

import { isForeignKeyViolation, isUniqueViolation } from "@/db/errors";

/**
 * Regression: Drizzle wraps the driver error, so the PostgreSQL code is not on
 * the thrown object. Checking only the top level meant a duplicate slug or
 * email threw instead of returning a field error, and the form showed nothing.
 */
describe("isUniqueViolation", () => {
  it("finds the code on the thrown error itself", () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
  });

  it("finds the code on cause, which is where Drizzle puts it", () => {
    const drizzleError = Object.assign(new Error("Failed query: insert into products"), {
      cause: Object.assign(new Error("duplicate key"), { code: "23505" }),
    });
    expect(isUniqueViolation(drizzleError)).toBe(true);
  });

  it("finds the code further down the chain", () => {
    expect(isUniqueViolation({ cause: { cause: { code: "23505" } } })).toBe(true);
  });

  it("ignores other database errors", () => {
    expect(isUniqueViolation({ cause: { code: "23503" } })).toBe(false);
    expect(isForeignKeyViolation({ cause: { code: "23503" } })).toBe(true);
  });

  it("survives anything that is not an error object", () => {
    for (const value of [null, undefined, "23505", 23505, {}, { cause: null }]) {
      expect(isUniqueViolation(value)).toBe(false);
    }
  });

  it("does not loop forever on a self-referencing cause", () => {
    const looping: Record<string, unknown> = {};
    looping.cause = looping;
    expect(isUniqueViolation(looping)).toBe(false);
  });
});
