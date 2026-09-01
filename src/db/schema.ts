import { relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* -------------------------------------------------------------------------- */
/*  Auth                                                                      */
/* -------------------------------------------------------------------------- */

export const userRole = pgEnum("user_role", ["admin", "editor"]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: userRole("role").notNull().default("editor"),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_key").on(sql`lower(${t.email})`)],
);

/* -------------------------------------------------------------------------- */
/*  Catalogue                                                                 */
/* -------------------------------------------------------------------------- */

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 120 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    /** Short blurb shown under the category heading on /collection. */
    description: text("description"),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("categories_slug_key").on(t.slug)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: varchar("slug", { length: 160 }).notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    /** Free text, e.g. "Stainless steel" or "Iron · Wood". */
    material: varchar("material", { length: 120 }),
    /** One-line description used on cards. */
    summary: text("summary"),
    /** Long copy on the product page. */
    description: text("description"),
    leadTime: varchar("lead_time", { length: 160 }),
    featured: boolean("featured").notNull().default(false),
    published: boolean("published").notNull().default(true),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("products_slug_key").on(t.slug)],
);

export const productImages = pgTable("product_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 240 }),
  width: integer("width"),
  height: integer("height"),
  /** The first image (position 0) is the card/hero shot. */
  position: integer("position").notNull().default(0),
  ...timestamps,
});

export const productSpecs = pgTable("product_specs", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 80 }).notNull(),
  value: varchar("value", { length: 240 }).notNull(),
  position: integer("position").notNull().default(0),
});

/* -------------------------------------------------------------------------- */
/*  Homepage content                                                          */
/* -------------------------------------------------------------------------- */

export const heroSlides = pgTable("hero_slides", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 240 }),
  /** Overlay line, e.g. "Donut — mirror-polished stainless steel". */
  caption: varchar("caption", { length: 240 }),
  /** Optional deep link to the object the frame shows. */
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

export const lookbookSize = pgEnum("lookbook_size", ["small", "medium", "large"]);

export const lookbookItems = pgTable("lookbook_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 240 }),
  width: integer("width").notNull().default(1200),
  height: integer("height").notNull().default(1500),
  /** Drives the staggered heights in the horizontal strip. */
  size: lookbookSize("size").notNull().default("medium"),
  position: integer("position").notNull().default(0),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

/* -------------------------------------------------------------------------- */
/*  Site-wide settings (single row)                                           */
/* -------------------------------------------------------------------------- */

export const siteSettings = pgTable("site_settings", {
  id: varchar("id", { length: 16 }).primaryKey().default("singleton"),
  aboutEyebrow: varchar("about_eyebrow", { length: 80 }),
  aboutHeading: text("about_heading"),
  aboutBody: text("about_body"),
  collaborationsHeading: text("collaborations_heading"),
  collaborationsBody: text("collaborations_body"),
  marqueeText: text("marquee_text"),
  showMarquee: boolean("show_marquee").notNull().default(true),
  heroAutoplay: boolean("hero_autoplay").notNull().default(true),
  email: varchar("email", { length: 160 }),
  phone: varchar("phone", { length: 60 }),
  instagram: varchar("instagram", { length: 120 }),
  pinterest: varchar("pinterest", { length: 160 }),
  city: varchar("city", { length: 80 }),
  ...timestamps,
});

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("subscribers_email_key").on(sql`lower(${t.email})`)],
);

/** Everything uploaded through the admin, so images can be re-picked later. */
export const mediaAssets = pgTable("media_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  url: text("url").notNull(),
  filename: varchar("filename", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 80 }).notNull(),
  width: integer("width"),
  height: integer("height"),
  bytes: integer("bytes"),
  alt: varchar("alt", { length: 240 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* -------------------------------------------------------------------------- */
/*  Relations                                                                 */
/* -------------------------------------------------------------------------- */

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  specs: many(productSpecs),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const productSpecsRelations = relations(productSpecs, ({ one }) => ({
  product: one(products, { fields: [productSpecs.productId], references: [products.id] }),
}));

export const heroSlidesRelations = relations(heroSlides, ({ one }) => ({
  product: one(products, { fields: [heroSlides.productId], references: [products.id] }),
}));

/* -------------------------------------------------------------------------- */
/*  Inferred types                                                            */
/* -------------------------------------------------------------------------- */

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type ProductSpec = typeof productSpecs.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type LookbookItem = typeof lookbookItems.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
