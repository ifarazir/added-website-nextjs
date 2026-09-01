import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("renders the hero, the manifesto and the catalogue sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("section[data-hero]")).toBeVisible();
    await expect(page.getByRole("heading", { name: /we add form to material/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Selected objects" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Index", exact: true })).toBeVisible();
    await expect(page.locator("#collaborations")).toBeAttached();
  });

  test("the hero caption always names the slide that is actually showing", async ({ page }) => {
    // Regression: the crossfade used to be started inside a setState updater,
    // which React may call more than once, so the caption ran a slide ahead.
    await page.goto("/");
    const dots = page.locator('[aria-label^="Show slide"]');
    const count = await dots.count();
    test.skip(count < 2, "needs more than one hero slide");

    for (let i = 0; i < count; i++) {
      await dots.nth(i).click();
      await page.waitForTimeout(1600);

      const visible = page.locator('section[data-hero] [data-slide]:not([aria-hidden="true"])');
      await expect(visible).toHaveCount(1);

      const alt = await visible.locator("img").getAttribute("alt");
      const caption = await page.locator("section[data-hero] p").innerText();

      // The caption and the alt text both start with the object's name.
      const object = caption.split("—")[0]!.trim().toLowerCase();
      expect(alt?.toLowerCase()).toContain(object.split(" ")[0]!);
    }
  });

  test("every in-page anchor resolves to a section", async ({ page }) => {
    // Regression: the header and footer linked to #collaborations before any
    // element carried that id.
    //
    // SEARCH and LOG IN are placeholders carried over from the brand design —
    // the site has no search and no customer accounts. They are listed here so
    // the test still fails if a *third* dead anchor appears.
    const PLACEHOLDERS = new Set(["search", "login"]);

    await page.goto("/");
    const hrefs = await page.locator('a[href^="/#"], a[href^="#"]').evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")!).filter((href) => href.length > 2),
    );

    expect(hrefs.length).toBeGreaterThan(0);
    const ids = new Set(hrefs.map((href) => href.replace(/^\/?#/, "")));

    for (const id of ids) {
      if (PLACEHOLDERS.has(id)) continue;
      await expect(page.locator(`#${id}`), `#${id} should exist`).toBeAttached();
    }

    // Every placeholder must still be one we know about.
    for (const id of PLACEHOLDERS) {
      expect([...ids], `${id} placeholder should still be in the header`).toContain(id);
    }
  });
});

test.describe("navigation", () => {
  test("the products menu opens and links into the catalogue", async ({ page }) => {
    await page.goto("/");

    const menu = page.locator("#products-menu");
    await expect(menu).toBeHidden();

    await page.getByRole("button", { name: "Products" }).click();
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("link").first()).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
  });

  test("a product card leads to its own page", async ({ page }) => {
    await page.goto("/collection");
    const first = page.locator('main a[href^="/product/"]').first();
    const href = await first.getAttribute("href");

    await first.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(page.locator("h1")).toBeVisible();
  });
});

test.describe("collection", () => {
  test("filters by category and keeps it in the URL", async ({ page }) => {
    await page.goto("/collection");
    const all = await page.locator('main a[href^="/product/"]').count();

    await page.getByRole("link", { name: "Decorative Objects" }).first().click();
    await expect(page).toHaveURL(/category=decorative-objects/);

    const filtered = await page.locator('main a[href^="/product/"]').count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(all);

    await expect(page.getByRole("heading", { name: "Decorative Objects" })).toBeVisible();
  });

  test("objects without photography show a placeholder, not an empty frame", async ({ page }) => {
    await page.goto("/collection");
    await expect(page.getByText(/product shot —/i).first()).toBeVisible();
  });
});

test.describe("product", () => {
  test("shows the specs and an enquiry link", async ({ page }) => {
    await page.goto("/product/donut");

    await expect(page.getByRole("heading", { name: "Donut", level: 1 })).toBeVisible();
    await expect(page.getByText("ø 90 mm × 32 mm")).toBeVisible();

    const enquire = page.getByRole("link", { name: /enquire about this object/i });
    await expect(enquire).toHaveAttribute("href", /^mailto:.*subject=/);
  });

  test("carries Product and BreadcrumbList structured data", async ({ page }) => {
    await page.goto("/product/donut");

    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const types = blocks.map((block) => JSON.parse(block)["@type"]);

    expect(types).toContain("Product");
    expect(types).toContain("BreadcrumbList");

    const product = blocks.map((b) => JSON.parse(b)).find((b) => b["@type"] === "Product");
    expect(product.name).toBe("Donut");
    // No prices anywhere on this site, so no offers block may be invented.
    expect(product.offers).toBeUndefined();
  });
});

test.describe("not found", () => {
  // Regression: a loading.tsx used to stream the response before notFound()
  // ran, so these returned 200 with a "not found" body.
  test("an unknown product is a real 404", async ({ page }) => {
    const response = await page.goto("/product/no-such-object");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: /not found/i })).toBeVisible();
  });

  test("an unknown category is a real 404", async ({ page }) => {
    const response = await page.goto("/collection?category=no-such-category");
    expect(response?.status()).toBe(404);
  });

  test("a known category still resolves", async ({ page }) => {
    const response = await page.goto("/collection?category=decorative-objects");
    expect(response?.status()).toBe(200);
  });
});

test.describe("SEO surface", () => {
  test("robots.txt keeps crawlers out of the admin", async ({ request }) => {
    const body = await (await request.get("/robots.txt")).text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Sitemap:");
  });

  test("the sitemap lists the catalogue", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    expect(body).toContain("/collection");
    expect(body).toContain("/product/donut");
  });
});

test.describe("newsletter", () => {
  test("accepts an address and rejects a malformed one", async ({ page }) => {
    await page.goto("/");

    const email = page.locator("#newsletter-email");
    await email.fill("not-an-email");
    // The browser's own validation stops this one before the action runs.
    await expect(email).toHaveJSProperty("validity.valid", false);

    await email.fill(`e2e-${Date.now()}@example.com`);
    await page.locator("form").filter({ has: email }).getByRole("button").click();
    await expect(page.getByText(/you're on the list/i)).toBeVisible();
  });

  test("carries a honeypot that no real visitor can reach", async ({ page }) => {
    await page.goto("/");
    const honeypot = page.locator('input[name="company"]');

    await expect(honeypot).toBeAttached();
    await expect(honeypot).not.toBeInViewport();
    await expect(honeypot).toHaveAttribute("tabindex", "-1");
  });
});

test.describe("reduced motion", () => {
  // The context is created explicitly rather than through test.use: merged with
  // the project's `devices` preset the reducedMotion option did not reach the
  // browser, which made the test pass vacuously.
  test("nothing animates and no content is left hidden", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();

    await page.goto("/");
    await page.waitForTimeout(1200);

    // Guard against the emulation silently not applying.
    await expect
      .poll(() =>
        page.evaluate(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      )
      .toBe(true);

    // GSAP is never registered, so the class that hides reveal targets until
    // their scroll trigger fires must never land on <html>.
    await expect(page.locator("html")).not.toHaveClass(/motion-ready/);

    const heading = page.getByRole("heading", { name: /we add form to material/i });
    await expect(heading).toBeVisible();
    await expect(heading).toHaveCSS("opacity", "1");

    // The marquee band holds still too.
    const marquee = page.locator(".animate-marquee").first();
    if ((await marquee.count()) > 0) {
      await expect(marquee).toHaveCSS("animation-name", "none");
    }

    await context.close();
  });

  test("the hero does not advance on its own", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();

    await page.goto("/");
    const caption = page.locator("section[data-hero] p");
    // textContent, not innerText: the caption is uppercased in CSS, and
    // toHaveText compares against the underlying text.
    const first = await caption.textContent();

    // Autoplay runs every 5.2s; this comfortably covers one tick.
    await page.waitForTimeout(6500);
    await expect(caption).toHaveText(first!);

    await context.close();
  });
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("the homepage does not scroll sideways", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(800);

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });

  test("the collection grid stacks", async ({ page }) => {
    await page.goto("/collection");
    await expect(page.locator('main a[href^="/product/"]').first()).toBeVisible();

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });
});
