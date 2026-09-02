import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  // A preview or client-review host is closed to crawlers entirely.
  if (!isIndexable(base)) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/uploads/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
