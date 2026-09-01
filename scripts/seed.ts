/**
 * Seeds the catalogue with the objects, copy and photography that came out of
 * the ADDED FORMS design handoff. Safe to re-run: rows are matched on their
 * natural keys (slug / url) and updated rather than duplicated.
 */
import "./load-env";

import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import manifest from "../src/lib/image-manifest.json";
import * as schema from "../src/db/schema";
import { hashPassword } from "../src/lib/password";

type ImageKey = keyof typeof manifest;

const img = (key: ImageKey) => ({
  url: `/images/${key}.jpg`,
  width: manifest[key].width,
  height: manifest[key].height,
});

const CATEGORIES = [
  { slug: "interior-objects", name: "Interior Objects", position: 1 },
  { slug: "personal-accessories", name: "Personal Accessories", position: 2 },
  { slug: "shelving-storage", name: "Shelving & Storage", position: 3 },
  { slug: "decorative-objects", name: "Decorative Objects", position: 4 },
];

type SeedProduct = {
  slug: string;
  name: string;
  category: string;
  material: string;
  featured?: boolean;
  description?: string;
  leadTime?: string;
  images?: { key: ImageKey; alt: string }[];
  specs?: [string, string][];
};

const LEAD_TIME = "Made to order in small batches. Lead time 2–3 weeks.";

const PRODUCTS: SeedProduct[] = [
  {
    slug: "wireframe",
    name: "Wireframe",
    category: "interior-objects",
    material: "Stainless steel",
    featured: true,
    description:
      "Bent stainless rod holding a single plane in the air. The frame does the structural work, so nothing else has to.",
    images: [{ key: "wireframe", alt: "Wireframe stand in stainless steel" }],
    specs: [["Material", "Stainless steel"], ["Finish", "Brushed"]],
  },
  {
    slug: "st-table",
    name: "St Table",
    category: "interior-objects",
    material: "Stainless steel",
    featured: true,
    description:
      "A side table reduced to a top and the least metal that will hold it. Mirror-polished, so it takes the colour of the room around it.",
    images: [{ key: "st-table", alt: "St Table in stainless steel" }],
    specs: [["Material", "Stainless steel"], ["Finish", "Mirror-polished"]],
  },
  {
    slug: "stools-benches",
    name: "Stools & Benches",
    category: "interior-objects",
    material: "Iron · Wood",
    description: "Iron frames carrying solid wood seats, in stool and bench lengths.",
    specs: [["Material", "Iron · Wood"]],
  },
  {
    slug: "magazine-rack",
    name: "Magazine Rack",
    category: "interior-objects",
    material: "Iron",
    description: "A folded iron sheet that leans against the wall and holds what is being read.",
    specs: [["Material", "Iron"]],
  },
  {
    slug: "mirror",
    name: "Mirror",
    category: "interior-objects",
    material: "Stainless steel",
    description: "Polished stainless with no frame and no fixings on show.",
    specs: [["Material", "Stainless steel"]],
  },
  {
    slug: "ufo",
    name: "UFO",
    category: "interior-objects",
    material: "Aluminium",
    featured: true,
    description:
      "A colander turned into an object worth leaving out — perforated, spun, and finished on both faces.",
    images: [{ key: "ufo-colander", alt: "UFO colander in brushed stainless steel" }],
    specs: [["Material", "Aluminium"], ["Finish", "Brushed"]],
  },
  {
    slug: "lior-comb",
    name: "Lior Comb",
    category: "personal-accessories",
    material: "Stainless steel",
    featured: true,
    description:
      "Cut from a single sheet of stainless steel and hand-finished along every tooth. Heavy enough to feel deliberate in the hand.",
    images: [{ key: "lior-comb", alt: "Lior comb, editorial still" }],
    specs: [["Material", "Stainless steel"], ["Finish", "Hand-polished"]],
  },
  {
    slug: "jooje",
    name: "Jooje",
    category: "personal-accessories",
    material: "Aluminium",
    featured: true,
    description:
      "A small cast sphere with a sand-blasted skin, made to be carried, set down, and picked up again.",
    images: [
      { key: "jooje-sand", alt: "Jooje object resting in sand" },
      { key: "jooje-sphere", alt: "Jooje mirror sphere on painted paper" },
    ],
    specs: [["Material", "Cast aluminium"], ["Finish", "Sand-blasted"]],
  },
  {
    slug: "custom-made",
    name: "Custom-Made",
    category: "personal-accessories",
    material: "On request",
    description:
      "One-off pieces developed with the client, in any of the studio's four materials.",
    leadTime: "Lead time depends on the piece — write to us and we will scope it.",
    specs: [["Material", "On request"]],
  },
  {
    slug: "trio-stand",
    name: "Trio Stand",
    category: "shelving-storage",
    material: "Iron",
    description: "Three iron uprights, three planes, one footprint.",
    specs: [["Material", "Iron"]],
  },
  {
    slug: "modular-shelf",
    name: "Modular Shelf",
    category: "shelving-storage",
    material: "Stainless · Iron",
    featured: true,
    description:
      "A shelving system that grows a bay at a time. Stainless shelves, iron structure, no visible fixings.",
    images: [{ key: "modular-shelf", alt: "Modular shelf system" }],
    specs: [["Material", "Stainless steel · Iron"], ["Configuration", "Modular — extends in bays"]],
  },
  {
    slug: "donut",
    name: "Donut",
    category: "decorative-objects",
    material: "Stainless steel",
    featured: true,
    description:
      "A solid ring of brushed stainless steel, weighted to sit still. A paperweight, an incense base, a small anchor for a shelf — the Donut does not insist on one use.",
    images: [
      { key: "donut", alt: "Donut — brushed stainless steel object on stone" },
      { key: "donut-hand", alt: "Donut object held in hand" },
    ],
    specs: [
      ["Material", "Brushed stainless steel"],
      ["Dimensions", "ø 90 mm × 32 mm"],
      ["Weight", "340 g"],
      ["Finish", "Brushed · engraved mark"],
    ],
  },
  {
    slug: "quarter",
    name: "1/4",
    category: "decorative-objects",
    material: "Aluminium",
    description: "A quarter section of the Donut, cut and finished as its own object.",
    specs: [["Material", "Aluminium"]],
  },
  {
    slug: "eighth",
    name: "1/8",
    category: "decorative-objects",
    material: "Aluminium",
    description: "The smallest cut in the series.",
    specs: [["Material", "Aluminium"]],
  },
];

/**
 * The hero runs full-bleed, so it only ever uses the 3122px originals. The
 * frames the design mocked up with (donut-in-hand, jooje in sand, the UFO
 * colander, the jooje sphere) exist solely as ~1000px extracts from the brand
 * PDF — no larger copy exists in the handoff — and were visibly soft at this
 * size. They are still attached to their own objects, where a card-sized crop
 * holds up. Swap them back in from the admin the moment the originals arrive.
 */
const HERO = [
  { key: "donut" as ImageKey, caption: "Donut — mirror-polished stainless steel", product: "donut", alt: "Donut object resting on white stone" },
  { key: "wireframe" as ImageKey, caption: "Wireframe — bent stainless rod", product: "wireframe", alt: "Wireframe stand beside a chair" },
  { key: "lior-comb" as ImageKey, caption: "Lior Comb — cut from a single sheet", product: "lior-comb", alt: "Lior comb held against the hair" },
  { key: "st-table" as ImageKey, caption: "St Table — mirror-polished stainless steel", product: "st-table", alt: "St Table in a living room" },
];

// Same rule as the hero: the strip runs up to 58vh tall, so originals only.
const LOOKBOOK: { key: ImageKey; size: "small" | "medium" | "large"; alt: string }[] = [
  { key: "lior-comb", size: "large", alt: "Comb editorial" },
  { key: "donut", size: "small", alt: "Donut on stone" },
  { key: "wireframe", size: "large", alt: "Wireframe stand editorial" },
  { key: "st-table", size: "small", alt: "St Table editorial" },
  { key: "modular-shelf", size: "medium", alt: "Modular shelf editorial" },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema, casing: "snake_case" });

  /* ---- admin ---------------------------------------------------------- */
  const email = process.env.ADMIN_EMAIL ?? "admin@addedforms.com";
  const password = process.env.ADMIN_PASSWORD;

  const [existingAdmin] = await db
    .select()
    .from(schema.users)
    .where(sql`lower(${schema.users.email}) = lower(${email})`)
    .limit(1);

  if (existingAdmin) {
    console.log(`· admin ${email} already exists — password left alone`);
  } else if (!password) {
    console.warn("! ADMIN_PASSWORD is not set — skipping admin creation");
  } else {
    await db.insert(schema.users).values({
      email,
      name: "Studio",
      passwordHash: await hashPassword(password),
      role: "admin",
    });
    console.log(`✓ admin created: ${email}`);
  }

  /* ---- categories ----------------------------------------------------- */
  const categoryIds = new Map<string, string>();
  for (const category of CATEGORIES) {
    const [row] = await db
      .insert(schema.categories)
      .values(category)
      .onConflictDoUpdate({
        target: schema.categories.slug,
        set: { name: category.name, position: category.position },
      })
      .returning({ id: schema.categories.id });
    categoryIds.set(category.slug, row.id);
  }
  console.log(`✓ ${CATEGORIES.length} categories`);

  /* ---- products ------------------------------------------------------- */
  const productIds = new Map<string, string>();
  for (const [i, product] of PRODUCTS.entries()) {
    const values = {
      slug: product.slug,
      name: product.name,
      categoryId: categoryIds.get(product.category) ?? null,
      material: product.material,
      description: product.description ?? null,
      summary: product.description?.split(". ")[0] ?? null,
      leadTime: product.leadTime ?? LEAD_TIME,
      featured: product.featured ?? false,
      published: true,
      position: i + 1,
    };

    const [row] = await db
      .insert(schema.products)
      .values(values)
      .onConflictDoUpdate({ target: schema.products.slug, set: values })
      .returning({ id: schema.products.id });

    productIds.set(product.slug, row.id);

    // Images and specs are fully owned by the seed, so they are replaced.
    await db.delete(schema.productImages).where(eq(schema.productImages.productId, row.id));
    if (product.images?.length) {
      await db.insert(schema.productImages).values(
        product.images.map((image, position) => ({
          productId: row.id,
          alt: image.alt,
          position,
          ...img(image.key),
        })),
      );
    }

    await db.delete(schema.productSpecs).where(eq(schema.productSpecs.productId, row.id));
    if (product.specs?.length) {
      await db.insert(schema.productSpecs).values(
        product.specs.map(([label, value], position) => ({
          productId: row.id,
          label,
          value,
          position,
        })),
      );
    }
  }
  console.log(`✓ ${PRODUCTS.length} products`);

  /* ---- homepage content ----------------------------------------------- */
  await db.delete(schema.heroSlides);
  await db.insert(schema.heroSlides).values(
    HERO.map((slide, position) => ({
      url: img(slide.key).url,
      alt: slide.alt,
      caption: slide.caption,
      productId: productIds.get(slide.product) ?? null,
      position,
      active: true,
    })),
  );

  await db.delete(schema.lookbookItems);
  await db.insert(schema.lookbookItems).values(
    LOOKBOOK.map((item, position) => ({
      alt: item.alt,
      size: item.size,
      position,
      active: true,
      ...img(item.key),
    })),
  );
  console.log(`✓ ${HERO.length} hero slides, ${LOOKBOOK.length} lookbook frames`);

  /* ---- settings ------------------------------------------------------- */
  const settings = {
    id: "singleton",
    aboutEyebrow: "About",
    aboutHeading: "We add form to material. Nothing more, nothing less.",
    aboutBody:
      "ADDED FORMS is a studio for interior accessories. Each object begins as raw stock — a rod, a sheet, a blank of wood — and is reduced to its essential geometry. What remains is quiet, precise, and made to stay.",
    collaborationsHeading: "We build with people who build carefully.",
    collaborationsBody:
      "The studio takes on a small number of collaborations each year — with architects and interior designers on pieces for a specific room, and with brands on objects that carry both names. Custom work starts from the same four materials and the same rule: reduce it until nothing is left to remove.",
    marqueeText:
      "Added Forms — Stainless Steel — Iron — Aluminium — Wood — Interior Objects — Personal Accessories — Shelving & Storage — Decorative Objects —",
    showMarquee: true,
    heroAutoplay: true,
    email: "hello@addedforms.com",
    phone: "+98 919 223 3701",
    instagram: "AddedForms",
    city: "Tehran — Iran",
  };

  await db
    .insert(schema.siteSettings)
    .values(settings)
    .onConflictDoUpdate({ target: schema.siteSettings.id, set: settings });
  console.log("✓ site settings");

  await client.end();
  console.log("\nSeed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
