import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow } from "@/components/site/eyebrow";
import { ProductCard } from "@/components/site/product-card";
import { getCategories, getPublishedProducts, getSettings } from "@/lib/queries";
import { cn, pad2 } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Collection",
  description:
    "Every ADDED FORMS object — interior objects, personal accessories, shelving and decorative pieces in stainless steel, iron, aluminium and wood.",
};

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: activeSlug } = await searchParams;
  const [categories, products, settings] = await Promise.all([
    getCategories(),
    getPublishedProducts(),
    getSettings(),
  ]);

  const active = categories.find((c) => c.slug === activeSlug);
  const list = active ? products.filter((p) => p.categoryId === active.id) : products;

  const filters = [
    { slug: null, label: "All" },
    ...categories.map((c) => ({ slug: c.slug, label: c.name })),
  ];

  return (
    <>
      {/* Starts below the header's PRODUCTS button, which floats at 25vh. */}
      <section className="bg-paper px-[6vw] pt-[26vh] md:px-[4vw] md:pt-[34vh]">
        <Eyebrow className="mb-[3vh]">{active ? active.name : "All objects"}</Eyebrow>

        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-hairline pb-[5vh] md:pr-[14vw]">
          <h1
            data-reveal
            className="font-display text-[clamp(40px,5.8vw,100px)] leading-[1.05] font-semibold tracking-[0.05em] uppercase"
          >
            {active ? active.name : "Collection"}
          </h1>
          <span className="text-xs font-light tracking-brand text-ink-55 uppercase">
            {pad2(list.length)} objects
          </span>
        </div>

        {active?.description && (
          <p className="mt-6 max-w-[52ch] text-sm leading-[1.85] font-light text-ink-70">
            {active.description}
          </p>
        )}

        <nav
          aria-label="Filter by category"
          className="flex flex-wrap gap-x-7 gap-y-3 py-6.5 md:gap-x-7"
        >
          {filters.map((filter) => {
            const isActive = (filter.slug ?? null) === (activeSlug ?? null);
            return (
              <Link
                key={filter.label}
                href={filter.slug ? `/collection?category=${filter.slug}` : "/collection"}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "border-b-2 pb-1 text-[11px] font-light tracking-brand uppercase transition-colors duration-300",
                  isActive ? "border-acid text-ink" : "border-transparent text-ink-45 hover:text-ink",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>
      </section>

      <section className="bg-paper px-[6vw] pt-[4vh] pb-[16vh] md:px-[4vw]">
        {list.length === 0 ? (
          <p className="py-[10vh] text-center text-[11px] tracking-wide-brand text-ink-45 uppercase">
            No objects in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-x-[2vw] gap-y-[7vh] sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-[9vh]">
            {list.map((product, i) => (
              <ProductCard
                key={product.id}
                index={i + 1}
                showCategory
                product={{
                  slug: product.slug,
                  name: product.name,
                  material: product.material,
                  categoryName: product.category?.name ?? null,
                  image: product.images[0]
                    ? { url: product.images[0].url, alt: product.images[0].alt }
                    : null,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-hairline bg-paper px-[6vw] py-[10vh] md:px-[4vw]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2
            data-reveal
            className="max-w-[18ch] font-display text-[clamp(24px,2.6vw,44px)] leading-[1.25] font-light tracking-[0.06em] uppercase"
          >
            Something custom in mind?
          </h2>
          <a
            href={`mailto:${settings.email}?subject=Enquiry%20%E2%80%94%20Custom-made`}
            className="inline-flex items-center gap-3 text-[11px] font-bold tracking-brand uppercase transition-opacity hover:opacity-60"
          >
            <span className="inline-block size-[7px] bg-acid" />
            Enquire — custom-made
          </a>
        </div>
      </section>
    </>
  );
}
