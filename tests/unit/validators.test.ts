import { describe, expect, it } from "vitest";

import {
  productSchema,
  settingsSchema,
  slugSchema,
  userUpdateSchema,
} from "@/lib/validators";

describe("slugSchema", () => {
  it("accepts clean slugs", () => {
    for (const slug of ["donut", "st-table", "1-4"]) {
      expect(slugSchema.safeParse(slug).success).toBe(true);
    }
  });

  it("rejects anything that would break a URL", () => {
    for (const slug of ["", "Donut", "st table", "st--table", "-donut", "donut-", "dôn"]) {
      expect(slugSchema.safeParse(slug).success).toBe(false);
    }
  });
});

describe("productSchema", () => {
  const base = { name: "Donut", slug: "donut" };

  it("fills in the defaults an empty form relies on", () => {
    const parsed = productSchema.parse(base);
    expect(parsed).toMatchObject({ published: true, featured: false, position: 0 });
    expect(parsed.images).toEqual([]);
    expect(parsed.specs).toEqual([]);
  });

  it("turns blank optional text into null rather than an empty string", () => {
    // The public pages test these for null to decide whether to render a
    // block at all, so "" would render an empty section.
    const parsed = productSchema.parse({ ...base, material: "", description: "" });
    expect(parsed.material).toBeNull();
    expect(parsed.description).toBeNull();
  });

  it("coerces the position that arrives from a number input as a string", () => {
    expect(productSchema.parse({ ...base, position: "7" }).position).toBe(7);
  });

  it("rejects an empty name", () => {
    expect(productSchema.safeParse({ ...base, name: "  " }).success).toBe(false);
  });

  it("caps the number of images and specs", () => {
    const image = { url: "/images/donut.jpg", alt: null, width: null, height: null };
    expect(productSchema.safeParse({ ...base, images: Array(13).fill(image) }).success).toBe(false);
    expect(productSchema.safeParse({ ...base, images: Array(12).fill(image) }).success).toBe(true);
  });
});

describe("userUpdateSchema", () => {
  const base = { name: "Studio", email: "studio@addedforms.com", role: "admin" as const };

  it("treats a blank password as 'leave it alone'", () => {
    expect(userUpdateSchema.parse({ ...base, password: "" }).password).toBeUndefined();
    expect(userUpdateSchema.parse(base).password).toBeUndefined();
  });

  it("still enforces length when a password is given", () => {
    expect(userUpdateSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
    expect(userUpdateSchema.safeParse({ ...base, password: "long-enough-1" }).success).toBe(true);
  });

  it("defaults to the least privilege", () => {
    expect(userUpdateSchema.parse({ name: "A", email: "a@b.com" }).role).toBe("editor");
  });

  it("rejects an unknown role", () => {
    expect(userUpdateSchema.safeParse({ ...base, role: "superuser" }).success).toBe(false);
  });
});

describe("settingsSchema", () => {
  it("defaults the toggles to on", () => {
    const parsed = settingsSchema.parse({});
    expect(parsed.showMarquee).toBe(true);
    expect(parsed.heroAutoplay).toBe(true);
  });
});
