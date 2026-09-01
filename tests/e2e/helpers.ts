import type { Page } from "@playwright/test";

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@addedforms.com";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "added-dev-2026";

/**
 * Signs in through the real form. A successful sign-in clears the login rate
 * limiter, so a test that deliberately fails a login should finish by calling
 * this — otherwise it spends the budget the later tests need.
 */
export async function signIn(page: Page, email = ADMIN_EMAIL, password = ADMIN_PASSWORD) {
  await page.goto("/admin/login");
  await page.fill("#email", email);
  await page.fill("#password", password);
  await page.click("button[type=submit]");
  await page.waitForURL(/\/admin(?!\/login)/);
}

/** Unique per run, so a re-run never trips a unique constraint. */
export function unique(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
}
