import "server-only";

import { and, asc, eq, ne } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/db";
import {
  categories,
  heroSlides,
  lookbookItems,
  products,
  siteSettings,
  type SiteSettings,
} from "@/db/schema";

/**
 * Every public read goes through this tag, and every admin write clears it.
 * Public routes are dynamic (the database is not available at build time), so
 * this is what keeps repeat requests off the connection pool.
 */
export const CONTENT_TAG = "content";

const cached = <T>(key: string, fn: () => Promise<T>) =>
  unstable_cache(fn, ["added", key], { tags: [CONTENT_TAG], revalidate: 300 })();

export const DEFAULT_SETTINGS = {
  aboutEyebrow: "About",
  aboutHeading: "We add form to material. Nothing more, nothing less.",
  aboutBody:
    "ADDED FORMS is a studio for interior accessories. Each object begins as raw stock — a rod, a sheet, a blank of wood — and is reduced to its essential geometry. What remains is quiet, precise, and made to stay.",
  marqueeText:
    "Added Forms — Stainless Steel — Iron — Aluminium — Wood — Interior Objects — Personal Accessories — Shelving & Storage — Decorative Objects —",
  showMarquee: true,
  heroAutoplay: true,
  email: "hello@addedforms.com",
  phone: "+98 919 223 3701",
  instagram: "AddedForms",
  pinterest: null,
  city: "Tehran — Iran",
} satisfies Partial<SiteSettings>;

export type Settings = typeof DEFAULT_SETTINGS & { id?: string };

export function getSettings() {
  return cached("settings", async () => {
    const [row] = await db.select().from(siteSettings).limit(1);
    if (!row) return DEFAULT_SETTINGS as Settings;

    // A blank field in the admin falls back to the brand default rather than
    // rendering an empty section.
    return {
      ...DEFAULT_SETTINGS,
      ...Object.fromEntries(
        Object.entries(row).filter(([, v]) => v !== null && v !== ""),
      ),
    } as Settings;
  });
}

export function getHeroSlides() {
  return cached("hero", () =>
    db.query.heroSlides.findMany({
      where: eq(heroSlides.active, true),
      orderBy: [asc(heroSlides.position)],
      with: { product: { columns: { slug: true } } },
    }),
  );
}

export function getLookbook() {
  return cached("lookbook", () =>
    db
      .select()
      .from(lookbookItems)
      .where(eq(lookbookItems.active, true))
      .orderBy(asc(lookbookItems.position)),
  );
}

export function getCategories() {
  return cached("categories", () =>
    db.select().from(categories).orderBy(asc(categories.position), asc(categories.name)),
  );
}

export function getFeaturedProducts() {
  return cached("featured", () =>
    db.query.products.findMany({
      where: and(eq(products.published, true), eq(products.featured, true)),
      orderBy: [asc(products.position), asc(products.name)],
      with: {
        category: true,
        images: { orderBy: (i, { asc: a }) => [a(i.position)], limit: 1 },
      },
    }),
  );
}

export function getPublishedProducts() {
  return cached("products", () =>
    db.query.products.findMany({
      where: eq(products.published, true),
      orderBy: [asc(products.position), asc(products.name)],
      with: {
        category: true,
        images: { orderBy: (i, { asc: a }) => [a(i.position)], limit: 1 },
      },
    }),
  );
}

export function getProductBySlug(slug: string) {
  return cached(`product:${slug}`, () =>
    db.query.products.findFirst({
      where: and(eq(products.slug, slug), eq(products.published, true)),
      with: {
        category: true,
        images: { orderBy: (i, { asc: a }) => [a(i.position)] },
        specs: { orderBy: (s, { asc: a }) => [a(s.position)] },
      },
    }),
  );
}

export function getRelatedProducts(productId: string, categoryId: string | null) {
  return cached(`related:${productId}`, () =>
    db.query.products.findMany({
      where: categoryId
        ? and(
            eq(products.published, true),
            eq(products.categoryId, categoryId),
            ne(products.id, productId),
          )
        : and(eq(products.published, true), ne(products.id, productId)),
      orderBy: [asc(products.position), asc(products.name)],
      limit: 3,
      with: { images: { orderBy: (i, { asc: a }) => [a(i.position)], limit: 1 } },
    }),
  );
}

export type ProductCard = Awaited<ReturnType<typeof getPublishedProducts>>[number];
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;
export type HeroSlideView = Awaited<ReturnType<typeof getHeroSlides>>[number];

/**
 * The PRODUCTS drop-down: one group per category, with a handful of its
 * objects underneath — the shape the brand sample uses.
 */
export function getNavGroups() {
  return cached("nav", async () => {
    const rows = await db.query.categories.findMany({
      orderBy: [asc(categories.position), asc(categories.name)],
      with: {
        products: {
          where: eq(products.published, true),
          orderBy: [asc(products.position), asc(products.name)],
          columns: { name: true, slug: true },
          limit: 4,
        },
      },
    });

    return rows.map((category) => ({
      label: category.name,
      href: `/collection?category=${category.slug}`,
      items: category.products.map((product) => ({
        label: product.name,
        href: `/product/${product.slug}`,
      })),
    }));
  });
}
