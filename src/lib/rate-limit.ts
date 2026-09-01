import "server-only";

/**
 * In-memory fixed-window rate limiter.
 *
 * Deliberately process-local: it needs no infrastructure and is enough to blunt
 * password guessing and newsletter spam on a single instance. Behind more than
 * one instance, or on a platform that recycles processes aggressively, move the
 * counter to Redis — `check()` is the only function that would change.
 */
type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
let lastSweep = Date.now();

/** Drop expired entries occasionally so the map cannot grow without bound. */
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets. */
  retryAfter: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  entry.count += 1;
  const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

  return {
    allowed: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    retryAfter,
  };
}

/** Clears a key after a success, so a correct password resets the budget. */
export function resetRateLimit(key: string) {
  buckets.delete(key);
}

/**
 * Best-effort client identity. `x-forwarded-for` is only trustworthy behind a
 * proxy that sets it, which is the normal deployment; without one every caller
 * collapses to a single bucket, which fails closed rather than open.
 */
export function clientKey(headers: Headers, scope: string) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || headers.get("x-real-ip") || "unknown";
  return `${scope}:${ip}`;
}
