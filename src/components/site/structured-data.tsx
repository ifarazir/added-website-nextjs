import type { ProductDetail } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

/**
 * JSON-LD for search engines. The studio shows no prices, so products are
 * described without an `offers` block rather than with a fabricated one.
 */
export function StructuredData({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built here from our own data, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organisationSchema(settings: { email?: string | null; phone?: string | null }) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "ADDED FORMS",
    url: base,
    logo: `${base}/favicon.svg`,
    description:
      "A studio for interior accessories in stainless steel, iron, aluminium and wood.",
    ...(settings.email && { email: settings.email }),
    ...(settings.phone && { telephone: settings.phone }),
  };
}

export function productSchema(product: ProductDetail) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: `${base}/product/${product.slug}`,
    ...(product.description && { description: product.description }),
    ...(product.material && { material: product.material }),
    ...(product.category && { category: product.category.name }),
    image: product.images.map((image) => `${base}${image.url}`),
    brand: { "@type": "Brand", name: "ADDED FORMS" },
    ...(product.specs.length > 0 && {
      additionalProperty: product.specs.map((spec) => ({
        "@type": "PropertyValue",
        name: spec.label,
        value: spec.value,
      })),
    }),
  };
}

export function breadcrumbSchema(product: ProductDetail) {
  const base = siteUrl();
  const trail = [
    { name: "Collection", item: `${base}/collection` },
    ...(product.category
      ? [
          {
            name: product.category.name,
            item: `${base}/collection?category=${product.category.slug}`,
          },
        ]
      : []),
    { name: product.name, item: `${base}/product/${product.slug}` },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}
