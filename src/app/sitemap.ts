import type { MetadataRoute } from "next";

import { getCategories, getPublishedProducts } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

// Reads the catalogue, so it cannot be generated at build time.
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [products, categories] = await Promise.all([getPublishedProducts(), getCategories()]);

  const newest = products.reduce<Date | undefined>(
    (latest, product) => (!latest || product.updatedAt > latest ? product.updatedAt : latest),
    undefined,
  );

  return [
    { url: base, lastModified: newest, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/collection`, lastModified: newest, changeFrequency: "weekly", priority: 0.9 },
    ...categories.map((category) => ({
      url: `${base}/collection?category=${category.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/product/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
