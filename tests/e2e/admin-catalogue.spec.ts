import { expect, test } from "@playwright/test";

import { signIn, unique } from "./helpers";

test.beforeEach(async ({ page }) => {
  await signIn(page);
});

test("an object can be created, seen on the site, edited and deleted", async ({ page }) => {
  const name = unique("Test Object");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // --- create --------------------------------------------------------------
  await page.goto("/admin/products/new");
  await page.fill("#name", name);
  await expect(page.locator("#slug")).toHaveValue(slug);

  await page.fill("#material", "Iron");
  await page.fill("#description", "Created by the end-to-end suite.");
  await page.getByRole("button", { name: "Add specification" }).click();
  await page.getByLabel("Spec label").fill("Material");
  await page.getByLabel("Spec value").fill("Iron");
  await page.getByRole("button", { name: "Create object" }).click();

  await expect(page).toHaveURL(/\/admin\/products$/);
  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();

  // --- live on the public site --------------------------------------------
  const product = await page.request.get(`/product/${slug}`);
  expect(product.status()).toBe(200);
  expect(await product.text()).toContain("Created by the end-to-end suite.");

  // --- edit ----------------------------------------------------------------
  await page.getByRole("row", { name: new RegExp(name) }).getByRole("link", { name: "Edit" }).click();
  await page.fill("#material", "Stainless steel");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.").first()).toBeVisible();

  await page.goto("/admin/products");
  await expect(page.getByRole("row", { name: new RegExp(name) })).toContainText("Stainless steel");

  // --- delete --------------------------------------------------------------
  await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();

  await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
  expect((await page.request.get(`/product/${slug}`)).status()).toBe(404);
});

test("an unpublished object disappears from the public site", async ({ page }) => {
  // Creates its own object rather than toggling a seeded one: a run that fails
  // half way through would otherwise leave the catalogue in a changed state.
  const name = unique("Draft Object");
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  await page.goto("/admin/products/new");
  await page.fill("#name", name);
  await page.getByRole("button", { name: "Create object" }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);

  expect((await page.request.get(`/product/${slug}`)).status()).toBe(200);

  await page.getByRole("row", { name: new RegExp(name) }).getByRole("link", { name: "Edit" }).click();
  await page.getByRole("switch", { name: "Published" }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Saved.").first()).toBeVisible();

  expect((await page.request.get(`/product/${slug}`)).status()).toBe(404);

  await page.goto("/admin/products");
  await expect(page.getByRole("row", { name: new RegExp(name) })).toContainText("Draft");

  await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
});

test("a duplicate slug is refused with a field error", async ({ page }) => {
  await page.goto("/admin/products/new");
  await page.fill("#name", "Donut Copy");
  await page.fill("#slug", "donut");
  await page.getByRole("button", { name: "Create object" }).click();

  await expect(page.getByText(/already in use/i)).toBeVisible();
  // The form must still hold what was typed.
  await expect(page.locator("#name")).toHaveValue("Donut Copy");
});

test("an invalid slug is refused before it reaches the database", async ({ page }) => {
  await page.goto("/admin/products/new");
  await page.fill("#name", "Bad Slug");
  await page.fill("#slug", "Not A Slug");
  await page.getByRole("button", { name: "Create object" }).click();

  await expect(page.getByText(/lowercase letters, numbers and hyphens/i)).toBeVisible();
});

test("a category can be added and removed", async ({ page }) => {
  const name = unique("Test Category");

  await page.goto("/admin/categories");
  await page.getByRole("button", { name: "New category" }).click();
  await page.getByLabel("Name").fill(name);
  await page.getByRole("button", { name: "Create" }).click();

  await expect(page.getByRole("row", { name: new RegExp(name) })).toBeVisible();

  await page.getByRole("row", { name: new RegExp(name) }).getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).last().click();
  await expect(page.getByRole("row", { name: new RegExp(name) })).toHaveCount(0);
});

test("settings copy reaches the homepage", async ({ page }) => {
  const heading = `We add form to material. ${unique("Run")}`;

  await page.goto("/admin/settings");
  await page.fill("#aboutHeading", heading);
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Settings saved.").first()).toBeVisible();

  await page.goto("/");
  await expect(page.getByRole("heading", { name: new RegExp(heading.slice(0, 30)) })).toBeVisible();

  // Restore the seeded copy.
  await page.goto("/admin/settings");
  await page.fill("#aboutHeading", "We add form to material. Nothing more, nothing less.");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByText("Settings saved.").first()).toBeVisible();
});

test("an uploaded image can be attached to an object", async ({ page }) => {
  await page.goto("/admin/media");

  const before = await page.locator("main img").count();
  await page.setInputFiles('input[type="file"]', {
    name: "e2e-upload.png",
    mimeType: "image/png",
    // 1x1 transparent PNG.
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    ),
  });

  // The toast auto-dismisses, so the assertion is on the library itself.
  await expect(page.locator("main img")).toHaveCount(before + 1, { timeout: 20_000 });
});

test("a non-image upload is rejected", async ({ page }) => {
  await page.goto("/admin/media");
  await page.setInputFiles('input[type="file"]', {
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("this is not an image"),
  });

  await expect(page.getByText(/unsupported file type/i)).toBeVisible();
});
