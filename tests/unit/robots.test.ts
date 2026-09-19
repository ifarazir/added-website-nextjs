import { afterEach, describe, expect, it } from "vitest";

import robots from "@/app/robots";

// The canonical URL is what decides the whole file, and Next inlines it into
// the build — so this is the only place the production rules can be checked.
// The Playwright suite runs on 127.0.0.1 and only ever sees the closed form.
afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe("robots.txt", () => {
  it("opens the real domain but keeps crawlers out of the admin and the uploads", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://addedforms.com";

    expect(robots()).toEqual({
      rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/uploads/"] }],
      sitemap: "https://addedforms.com/sitemap.xml",
    });
  });

  it("closes a review deployment completely, and advertises no sitemap", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://added-website.vercel.app";

    expect(robots()).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
  });

  it("treats the host the end-to-end suite runs on as a review deployment", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3100";

    expect(robots()).toEqual({ rules: [{ userAgent: "*", disallow: "/" }] });
  });
});
