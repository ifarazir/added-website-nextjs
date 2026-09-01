import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clientKey, rateLimit, resetRateLimit } from "@/lib/rate-limit";

// Each test uses its own key so the module-level map cannot leak between them.
let n = 0;
const key = () => `test-${n++}-${Math.random()}`;

describe("rateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows up to the limit and then blocks", () => {
    const k = key();
    for (let i = 0; i < 3; i++) expect(rateLimit(k, 3, 1000).allowed).toBe(true);
    expect(rateLimit(k, 3, 1000).allowed).toBe(false);
  });

  it("counts down the remaining budget", () => {
    const k = key();
    expect(rateLimit(k, 3, 1000).remaining).toBe(2);
    expect(rateLimit(k, 3, 1000).remaining).toBe(1);
    expect(rateLimit(k, 3, 1000).remaining).toBe(0);
    expect(rateLimit(k, 3, 1000).remaining).toBe(0);
  });

  it("reopens once the window passes", () => {
    const k = key();
    rateLimit(k, 1, 1000);
    expect(rateLimit(k, 1, 1000).allowed).toBe(false);

    vi.advanceTimersByTime(1001);
    expect(rateLimit(k, 1, 1000).allowed).toBe(true);
  });

  it("reports how long is left", () => {
    const k = key();
    rateLimit(k, 1, 10_000);
    const blocked = rateLimit(k, 1, 10_000);
    expect(blocked.retryAfter).toBeGreaterThan(0);
    expect(blocked.retryAfter).toBeLessThanOrEqual(10);
  });

  it("keeps separate keys independent", () => {
    const a = key();
    const b = key();
    rateLimit(a, 1, 1000);
    expect(rateLimit(a, 1, 1000).allowed).toBe(false);
    expect(rateLimit(b, 1, 1000).allowed).toBe(true);
  });

  it("clears a key on demand, which is what a successful login does", () => {
    const k = key();
    rateLimit(k, 1, 10_000);
    expect(rateLimit(k, 1, 10_000).allowed).toBe(false);

    resetRateLimit(k);
    expect(rateLimit(k, 1, 10_000).allowed).toBe(true);
  });
});

describe("clientKey", () => {
  it("takes the first hop of x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 70.41.3.18" });
    expect(clientKey(headers, "login")).toBe("login:203.0.113.5");
  });

  it("falls back to x-real-ip", () => {
    expect(clientKey(new Headers({ "x-real-ip": "203.0.113.9" }), "login")).toBe(
      "login:203.0.113.9",
    );
  });

  it("collapses to one bucket when no proxy header is present", () => {
    // Fails closed: without a proxy every caller shares a budget, which is
    // safer than handing everyone their own.
    expect(clientKey(new Headers(), "newsletter")).toBe("newsletter:unknown");
  });

  it("keeps scopes apart", () => {
    const headers = new Headers({ "x-real-ip": "203.0.113.9" });
    expect(clientKey(headers, "login")).not.toBe(clientKey(headers, "newsletter"));
  });
});
