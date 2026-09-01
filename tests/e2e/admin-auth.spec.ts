import { expect, test } from "@playwright/test";

import { ADMIN_EMAIL, ADMIN_PASSWORD, signIn } from "./helpers";

test.describe("access control", () => {
  test("an anonymous visitor is sent to the login form", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fproducts/);
  });

  test("signing in lands on the page that was asked for", async ({ page }) => {
    await page.goto("/admin/categories");
    await page.fill("#email", ADMIN_EMAIL);
    await page.fill("#password", ADMIN_PASSWORD);
    await page.click("button[type=submit]");

    await expect(page).toHaveURL(/\/admin\/categories$/);
  });

  test("the next parameter cannot be used to redirect off the admin", async ({ page }) => {
    // An open redirect would let a phishing link bounce a signed-in editor to
    // an attacker's page carrying the admin's trust.
    await page.goto("/admin/login?next=https://example.com/phish");
    await page.fill("#email", ADMIN_EMAIL);
    await page.fill("#password", ADMIN_PASSWORD);
    await page.click("button[type=submit]");

    await expect(page).toHaveURL(/127\.0\.0\.1.*\/admin$/);
  });

  test("a wrong password is refused and the email survives", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#email", ADMIN_EMAIL);
    await page.fill("#password", "definitely-not-the-password");
    await page.click("button[type=submit]");

    await expect(page.getByText(/do not match an account/i)).toBeVisible();
    // React resets a form after an action; the login form works around it so a
    // failed attempt does not make the user retype their address.
    await expect(page.locator("#email")).toHaveValue(ADMIN_EMAIL);

    // Give the rate limiter its budget back for the rest of the suite.
    await signIn(page);
  });

  test("an unknown address gets the same message as a wrong password", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill("#email", "nobody@addedforms.com");
    await page.fill("#password", "whatever-goes-here");
    await page.click("button[type=submit]");

    await expect(page.getByText(/do not match an account/i)).toBeVisible();
    await signIn(page);
  });

  test("signing out clears the session", async ({ page }) => {
    await signIn(page);

    await page.getByRole("button", { name: /studio/i }).click();
    await page.getByText("Sign out").click();
    await expect(page).toHaveURL(/\/admin\/login/);

    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("the admin is not indexable", async ({ page }) => {
    const response = await page.goto("/admin/login");
    expect(response?.status()).toBe(200);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("panel", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test("the dashboard counts the catalogue", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Objects", { exact: true })).toBeVisible();
  });

  test("every nav destination loads", async ({ page }) => {
    for (const [label, heading] of [
      ["Products", "Products"],
      ["Categories", "Categories"],
      ["Hero slides", "Hero slides"],
      ["Lookbook", "Lookbook"],
      ["Media", "Media"],
      ["Subscribers", "Subscribers"],
      ["Settings", "Settings"],
      ["Accounts", "Accounts"],
    ]) {
      await page.getByRole("link", { name: label!, exact: true }).first().click();
      await expect(page.getByRole("heading", { name: heading!, level: 1 })).toBeVisible();
    }
  });
});
