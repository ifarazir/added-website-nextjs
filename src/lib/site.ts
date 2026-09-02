/** Canonical origin, without a trailing slash. */
export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Whether this deployment should be indexed.
 *
 * A review deployment on a *.vercel.app host must not be: it would compete with
 * the real domain for the same content, and a client-review URL has no business
 * in search results. Indexing switches on as soon as NEXT_PUBLIC_SITE_URL points
 * at the real domain.
 */
export function isIndexable(url = siteUrl()) {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }

  if (host === "localhost" || host === "127.0.0.1") return false;
  if (host.endsWith(".vercel.app") || host.endsWith(".vercel.sh")) return false;

  return true;
}
