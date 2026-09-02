import { afterEach, describe, expect, it } from "vitest";

import { isIndexable, siteUrl } from "@/lib/site";

afterEach(() => {
  delete process.env.NEXT_PUBLIC_SITE_URL;
});

describe("siteUrl", () => {
  it("drops a trailing slash so paths can be appended", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://addedforms.com/";
    expect(siteUrl()).toBe("https://addedforms.com");
  });

  it("falls back to localhost", () => {
    expect(siteUrl()).toBe("http://localhost:3000");
  });
});

describe("isIndexable", () => {
  it("allows a real domain", () => {
    expect(isIndexable("https://addedforms.com")).toBe(true);
    expect(isIndexable("https://www.addedforms.com")).toBe(true);
  });

  it("refuses preview and review hosts", () => {
    // A client-review deployment must not compete with the real domain.
    expect(isIndexable("https://added-website.vercel.app")).toBe(false);
    expect(isIndexable("https://added-website-git-main-arina7.vercel.app")).toBe(false);
  });

  it("refuses local development", () => {
    expect(isIndexable("http://localhost:3000")).toBe(false);
    expect(isIndexable("http://127.0.0.1:3100")).toBe(false);
  });

  it("refuses a malformed url rather than assuming it is safe", () => {
    expect(isIndexable("not a url")).toBe(false);
    expect(isIndexable("")).toBe(false);
  });
});
