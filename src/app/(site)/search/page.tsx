import type { Metadata } from "next";
import Link from "next/link";

import { Eyebrow } from "@/components/site/eyebrow";
import { ProductCard } from "@/components/site/product-card";
import { SearchField } from "@/components/site/search-field";
import { getCategories, searchProducts } from "@/lib/queries";
import { pad2 } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the ADDED FORMS catalogue by object, material or category.",
  // Search result pages are not worth indexing.
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim();

  const [results, categories] = await Promise.all([
    term ? searchProducts(term) : Promise.resolve([]),
    getCategories(),
  ]);

  const tooShort = term.length > 0 && term.length < 2;

  return (
    <>
      <section className="bg-paper px-[6vw] pt-[26vh] md:pr-[4vw] md:pl-[9vw] md:pt-[34vh]">
        <Eyebrow className="mb-[3vh]">Search</Eyebrow>

        <div className="border-b border-hairline pb-[5vh] md:pr-[14vw]">
          <SearchField initialValue={term} />
        </div>

        {term && !tooShort && (
          <p className="mt-6 text-xs font-light tracking-brand text-ink-55 uppercase">
            {pad2(results.length)} {results.length === 1 ? "object" : "objects"} for “{term}”
          </p>
        )}
      </section>

      <section className="bg-paper px-[6vw] pt-[6vh] pb-[16vh] md:pr-[4vw] md:pl-[9vw]">
        {!term ? (
          <div className="flex flex-col gap-6">
            <p className="max-w-[44ch] text-[15px] leading-[1.85] font-light text-ink-70">
              Search by object, material or category — try “steel”, “aluminium” or “shelf”.
            </p>
            <nav className="flex flex-wrap gap-x-7 gap-y-3">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/collection?category=${category.slug}`}
                  className="border-b-2 border-transparent pb-1 text-[11px] font-light tracking-brand text-ink-45 uppercase transition-colors hover:border-acid hover:text-ink"
                >
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>
        ) : tooShort ? (
          <p className="text-[11px] tracking-wide-brand text-ink-45 uppercase">
            Type at least two characters.
          </p>
        ) : results.length === 0 ? (
          <div className="flex flex-col gap-6">
            <p className="text-[11px] tracking-wide-brand text-ink-45 uppercase">
              Nothing matches “{term}”.
            </p>
            <Link
              href="/collection"
              className="inline-flex w-fit items-center gap-3 text-[11px] font-bold tracking-brand uppercase transition-opacity hover:opacity-60"
            >
              <span className="inline-block size-[7px] bg-acid" />
              Browse the whole collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-[2vw] gap-y-[7vh] sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-[9vh]">
            {results.map((product, i) => (
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
    </>
  );
}
