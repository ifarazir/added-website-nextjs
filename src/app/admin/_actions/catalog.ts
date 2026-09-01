"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import { categories, productImages, products, productSpecs } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/queries";
import { categorySchema, productSchema } from "@/lib/validators";

import { fail, fieldErrors, ok, type ActionState } from "./types";

/** Clears the public cache and the admin lists in one go. */
function refresh() {
  revalidateTag(CONTENT_TAG);
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
}

const bool = (formData: FormData, key: string) =>
  formData.get(key) === "on" || formData.get(key) === "true";

function rawCategoryId(formData: FormData) {
  const value = String(formData.get("categoryId") ?? "");
  return value && value !== "__none__" ? value : null;
}

function parseProduct(formData: FormData) {
  // Images and specs are edited as repeatable rows on the client and arrive as
  // one JSON blob each, so the whole form validates in a single pass.
  const json = (key: string) => {
    try {
      const raw = formData.get(key);
      return raw ? JSON.parse(String(raw)) : [];
    } catch {
      return [];
    }
  };

  return productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    // The select uses a sentinel because Radix cannot hold an empty value.
    categoryId: rawCategoryId(formData),
    material: formData.get("material"),
    summary: formData.get("summary"),
    description: formData.get("description"),
    leadTime: formData.get("leadTime"),
    featured: bool(formData, "featured"),
    published: bool(formData, "published"),
    position: formData.get("position") ?? 0,
    images: json("images"),
    specs: json("specs"),
  });
}

/** Replaces a product's images and specs; both are always edited as a whole set. */
async function writeChildren(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  productId: string,
  data: { images: { url: string; alt: string | null; width: number | null; height: number | null }[]; specs: { label: string; value: string }[] },
) {
  await tx.delete(productImages).where(eq(productImages.productId, productId));
  if (data.images.length) {
    await tx.insert(productImages).values(
      data.images.map((image, position) => ({ ...image, productId, position })),
    );
  }

  await tx.delete(productSpecs).where(eq(productSpecs.productId, productId));
  if (data.specs.length) {
    await tx.insert(productSpecs).values(
      data.specs.map((spec, position) => ({ ...spec, productId, position })),
    );
  }
}

export async function createProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const parsed = parseProduct(formData);
  if (!parsed.success) return fail("Check the form.", fieldErrors(parsed.error.issues));

  const { images, specs, ...values } = parsed.data;

  try {
    await db.transaction(async (tx) => {
      const [row] = await tx.insert(products).values(values).returning({ id: products.id });
      await writeChildren(tx, row.id, { images, specs });
    });
  } catch (error) {
    if (isUniqueViolation(error)) return fail("That slug is already taken.", { slug: "Already in use." });
    throw error;
  }

  refresh();
  return ok(`“${values.name}” created.`);
}

export async function updateProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing product id.");

  const parsed = parseProduct(formData);
  if (!parsed.success) return fail("Check the form.", fieldErrors(parsed.error.issues));

  const { images, specs, ...values } = parsed.data;

  try {
    await db.transaction(async (tx) => {
      await tx.update(products).set(values).where(eq(products.id, id));
      await writeChildren(tx, id, { images, specs });
    });
  } catch (error) {
    if (isUniqueViolation(error)) return fail("That slug is already taken.", { slug: "Already in use." });
    throw error;
  }

  refresh();
  revalidatePath(`/admin/products/${id}`);
  return ok("Saved.");
}

export async function deleteProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing product id.");

  await db.delete(products).where(eq(products.id, id));
  refresh();
  return ok("Product deleted.");
}

/** Row-level toggles from the products table. */
export async function setProductFlag(formData: FormData) {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const field = String(formData.get("field") ?? "");
  const value = formData.get("value") === "true";
  if (!id || (field !== "published" && field !== "featured")) return;

  await db.update(products).set({ [field]: value }).where(eq(products.id, id));
  refresh();
}

export async function saveCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    position: formData.get("position") ?? 0,
  });

  if (!parsed.success) return fail("Check the form.", fieldErrors(parsed.error.issues));

  try {
    if (id) {
      await db.update(categories).set(parsed.data).where(eq(categories.id, id));
    } else {
      await db.insert(categories).values(parsed.data);
    }
  } catch (error) {
    if (isUniqueViolation(error)) return fail("That slug is already taken.", { slug: "Already in use." });
    throw error;
  }

  refresh();
  return ok(id ? "Category saved." : `“${parsed.data.name}” created.`);
}

export async function deleteCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing category id.");

  // Products keep existing; their category is nulled by the FK rule.
  await db.delete(categories).where(eq(categories.id, id));
  refresh();
  return ok("Category deleted. Its objects are now uncategorised.");
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}
