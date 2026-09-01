import { expect, test } from "@playwright/test";

import { ADMIN_EMAIL, signIn, unique } from "./helpers";

const EDITOR_PASSWORD = "editor-password-for-tests";

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("an editor account can be created, signed into and removed", async ({ page, context }) => {
  const name = unique("Editor");
  const email = `${name.toLowerCase()}@addedforms.com`;

  // --- create --------------------------------------------------------------
  await page.goto("/admin/users");
  await page.getByRole("button", { name: "New account" }).click();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(EDITOR_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByRole("row", { name: new RegExp(name) })).toContainText("editor");

  // --- the new account can sign in and edit the catalogue ------------------
  const editorPage = await context.browser()!.newContext();
  const editor = await editorPage.newPage();
  await signIn(editor, email, EDITOR_PASSWORD);

  await editor.goto("/admin/products");
  await expect(editor.getByRole("heading", { name: "Products", level: 1 })).toBeVisible();

  // --- but not the accounts page -------------------------------------------
  await expect(editor.getByRole("link", { name: "Accounts" })).toHaveCount(0);
  await editor.goto("/admin/users");
  await expect(editor).toHaveURL(/\/admin$/);

  await editorPage.close();

  // --- remove --------------------------------------------------------------
  await page.goto("/admin/users");
  await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Remove account" }).click();

  await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);

  // The deleted account can no longer sign in.
  const goneContext = await context.browser()!.newContext();
  const gone = await goneContext.newPage();
  await gone.goto("/admin/login");
  await gone.fill("#email", email);
  await gone.fill("#password", EDITOR_PASSWORD);
  await gone.click("button[type=submit]");
  await expect(gone.getByText(/do not match an account/i)).toBeVisible();
  await goneContext.close();
});

test("the signed-in admin cannot delete or demote themselves", async ({ page }) => {
  await page.goto("/admin/users");

  const own = page.getByRole("row", { name: new RegExp(ADMIN_EMAIL) });
  await expect(own).toContainText("(you)");

  // Delete is inert on your own row rather than being offered and then refused.
  await expect(own.getByRole("button", { name: "Delete" })).toHaveCount(0);

  await own.getByRole("button", { name: "Edit" }).click();
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: "Editor" }).click();
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page.getByText(/last admin|your own admin access/i).first()).toBeVisible();
});

test("a duplicate email is refused", async ({ page }) => {
  await page.goto("/admin/users");
  await page.getByRole("button", { name: "New account" }).click();
  await page.getByLabel("Name").fill("Duplicate");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(EDITOR_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText(/already in use/i)).toBeVisible();
});

test("a short password is refused", async ({ page }) => {
  await page.goto("/admin/users");
  await page.getByRole("button", { name: "New account" }).click();
  await page.getByLabel("Name").fill(unique("Short"));
  await page.getByLabel("Email").fill(`${unique("short")}@addedforms.com`);
  await page.getByLabel("Password", { exact: true }).fill("short");
  await page.getByRole("button", { name: "Create account" }).click();

  await expect(page.getByText(/at least 10 characters/i)).toBeVisible();
});

test("an admin can reset another account's password", async ({ page, context }) => {
  const name = unique("Reset");
  const email = `${name.toLowerCase()}@addedforms.com`;
  const replacement = "replacement-password-1";

  await page.goto("/admin/users");
  await page.getByRole("button", { name: "New account" }).click();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(EDITOR_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();

  await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("New password").fill(replacement);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText(/password was reset/i).first()).toBeVisible();

  const fresh = await context.browser()!.newContext();
  const other = await fresh.newPage();
  await signIn(other, email, replacement);
  await expect(other).toHaveURL(/\/admin$/);
  await fresh.close();

  await page.goto("/admin/users");
  await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Remove account" }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
});

test("changing your own password works and the old one stops working", async ({
  page,
  context,
}) => {
  const name = unique("Rotator");
  const email = `${name.toLowerCase()}@addedforms.com`;
  const rotated = "rotated-password-99";

  await page.goto("/admin/users");
  await page.getByRole("button", { name: "New account" }).click();
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(EDITOR_PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();

  const editorContext = await context.browser()!.newContext();
  const editor = await editorContext.newPage();
  await signIn(editor, email, EDITOR_PASSWORD);

  await editor.goto("/admin/account");
  await editor.getByLabel("Current password").fill("the-wrong-one");
  await editor.getByLabel("New password", { exact: true }).fill(rotated);
  await editor.getByLabel("Confirm new password").fill(rotated);
  await editor.getByRole("button", { name: "Change password" }).click();
  await expect(editor.getByText(/current password is not right/i).first()).toBeVisible();

  await editor.getByLabel("Current password").fill(EDITOR_PASSWORD);
  await editor.getByLabel("New password", { exact: true }).fill(rotated);
  await editor.getByLabel("Confirm new password").fill("something-else-entirely");
  await editor.getByRole("button", { name: "Change password" }).click();
  await expect(editor.getByText(/do not match/i).first()).toBeVisible();

  await editor.getByLabel("Current password").fill(EDITOR_PASSWORD);
  await editor.getByLabel("New password", { exact: true }).fill(rotated);
  await editor.getByLabel("Confirm new password").fill(rotated);
  await editor.getByRole("button", { name: "Change password" }).click();
  await expect(editor.getByText("Password changed.").first()).toBeVisible();

  await editorContext.close();

  const check = await context.browser()!.newContext();
  const checkPage = await check.newPage();
  await checkPage.goto("/admin/login");
  await checkPage.fill("#email", email);
  await checkPage.fill("#password", EDITOR_PASSWORD);
  await checkPage.click("button[type=submit]");
  await expect(checkPage.getByText(/do not match an account/i)).toBeVisible();

  await signIn(checkPage, email, rotated);
  await expect(checkPage).toHaveURL(/\/admin$/);
  await check.close();

  await page.goto("/admin/users");
  await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Remove account" }).click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
});
