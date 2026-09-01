import { z } from "zod";

const trimmed = (max: number) => z.string().trim().max(max);
const optionalText = (max: number) =>
  trimmed(max)
    .optional()
    .transform((v) => (v === "" ? null : (v ?? null)));

export const slugSchema = z
  .string()
  .trim()
  .min(1, "A slug is required.")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens only.");

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Enter your email.").email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "That is too long.");

export const categorySchema = z.object({
  name: trimmed(120).min(1, "A name is required."),
  slug: slugSchema,
  description: optionalText(2000),
  position: z.coerce.number().int().min(0).max(999).default(0),
});

export const productImageSchema = z.object({
  url: z.string().min(1),
  alt: z.string().max(240).nullable().default(null),
  width: z.number().int().positive().nullable().default(null),
  height: z.number().int().positive().nullable().default(null),
});

export const productSpecSchema = z.object({
  label: trimmed(80).min(1),
  value: trimmed(240).min(1),
});

export const productSchema = z.object({
  name: trimmed(160).min(1, "A name is required."),
  slug: slugSchema,
  categoryId: z.string().uuid().nullable().optional().default(null),
  material: optionalText(120),
  summary: optionalText(500),
  description: optionalText(4000),
  leadTime: optionalText(160),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  position: z.coerce.number().int().min(0).max(999).default(0),
  images: z.array(productImageSchema).max(12, "Twelve images is the maximum.").default([]),
  specs: z.array(productSpecSchema).max(20, "Twenty specs is the maximum.").default([]),
});

export const heroSlideSchema = z.object({
  url: z.string().min(1, "Pick an image."),
  alt: optionalText(240),
  caption: optionalText(240),
  productId: z.string().uuid().nullable().optional().default(null),
  position: z.coerce.number().int().min(0).max(99).default(0),
  active: z.boolean().default(true),
});

export const lookbookSchema = z.object({
  url: z.string().min(1, "Pick an image."),
  alt: optionalText(240),
  width: z.coerce.number().int().positive().default(1200),
  height: z.coerce.number().int().positive().default(1500),
  size: z.enum(["small", "medium", "large"]).default("medium"),
  position: z.coerce.number().int().min(0).max(99).default(0),
  active: z.boolean().default(true),
});

export const settingsSchema = z.object({
  aboutEyebrow: optionalText(80),
  aboutHeading: optionalText(400),
  aboutBody: optionalText(2000),
  collaborationsHeading: optionalText(400),
  collaborationsBody: optionalText(2000),
  marqueeText: optionalText(600),
  showMarquee: z.boolean().default(true),
  heroAutoplay: z.boolean().default(true),
  email: optionalText(160),
  phone: optionalText(60),
  instagram: optionalText(120),
  pinterest: optionalText(160),
  city: optionalText(80),
});

export type ProductInput = z.input<typeof productSchema>;
export type CategoryInput = z.input<typeof categorySchema>;
