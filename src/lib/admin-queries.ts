import "server-only";

import { asc, count, desc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  categories,
  heroSlides,
  lookbookItems,
  mediaAssets,
  products,
  siteSettings,
  subscribers,
} from "@/db/schema";

/** Admin reads are always live — an editor must see what they just saved. */

export function listProducts() {
  return db.query.products.findMany({
    orderBy: [asc(products.position), asc(products.name)],
    with: {
      category: true,
      images: { orderBy: (i, { asc: a }) => [a(i.position)], limit: 1 },
    },
  });
}

export function getProduct(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: { orderBy: (i, { asc: a }) => [a(i.position)] },
      specs: { orderBy: (s, { asc: a }) => [a(s.position)] },
    },
  });
}

export function listCategories() {
  return db.query.categories.findMany({
    orderBy: [asc(categories.position), asc(categories.name)],
    with: { products: { columns: { id: true } } },
  });
}

export function listHeroSlides() {
  return db.query.heroSlides.findMany({
    orderBy: [asc(heroSlides.position)],
    with: { product: { columns: { id: true, name: true } } },
  });
}

export function listLookbook() {
  return db.select().from(lookbookItems).orderBy(asc(lookbookItems.position));
}

export function listMedia() {
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(200);
}

export function listSubscribers() {
  return db.select().from(subscribers).orderBy(desc(subscribers.createdAt));
}

export async function getSettingsRow() {
  const [row] = await db.select().from(siteSettings).limit(1);
  return row ?? null;
}

export async function getDashboardStats() {
  const [[productCount], [categoryCount], [subscriberCount], [mediaCount]] = await Promise.all([
    db.select({ value: count() }).from(products),
    db.select({ value: count() }).from(categories),
    db.select({ value: count() }).from(subscribers),
    db.select({ value: count() }).from(mediaAssets),
  ]);

  const [[publishedCount], [featuredCount]] = await Promise.all([
    db.select({ value: count() }).from(products).where(eq(products.published, true)),
    db.select({ value: count() }).from(products).where(eq(products.featured, true)),
  ]);

  return {
    products: productCount.value,
    published: publishedCount.value,
    featured: featuredCount.value,
    categories: categoryCount.value,
    subscribers: subscriberCount.value,
    media: mediaCount.value,
  };
}

export function listProductOptions() {
  return db
    .select({ id: products.id, name: products.name })
    .from(products)
    .orderBy(asc(products.name));
}
