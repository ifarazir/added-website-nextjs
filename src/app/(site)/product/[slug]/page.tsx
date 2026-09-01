import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Eyebrow } from "@/components/site/eyebrow";
import { PlaceholderTile } from "@/components/site/placeholder-tile";
import { ProductCard } from "@/components/site/product-card";
import { getProductBySlug, getRelatedProducts, getSettings } from "@/lib/queries";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Not found" };

  const description = product.summary ?? product.description ?? undefined;
  const image = product.images[0]?.url;

  return {
    title: product.name,
    description,
    openGraph: {
      title: `${product.name} — ADDED FORMS`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Params) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, settings] = await Promise.all([
    getRelatedProducts(product.id, product.categoryId),
    getSettings(),
  ]);

  const [lead, ...rest] = product.images;
  const subject = encodeURIComponent(`Enquiry — ${product.name}`);

  return (
    <>
      <section className="grid grid-cols-1 items-start bg-paper lg:grid-cols-[1.15fr_1fr]">
        {/* Image column — scrolls past the sticky details. */}
        <div className="flex flex-col gap-0.5">
          <div className="relative h-[60vh] overflow-hidden bg-shade lg:h-screen">
            {lead ? (
              <Image
                src={lead.url}
                alt={lead.alt ?? product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            ) : (
              <PlaceholderTile label={product.name} />
            )}
          </div>

          {rest.map((image) => (
            <div key={image.id} data-plx className="relative h-[50vh] overflow-hidden bg-shade lg:h-[70vh]">
              <Image
                src={image.url}
                alt={image.alt ?? product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {/* Details — sticky on desktop, stacked underneath on smaller screens. */}
        <div className="box-border flex min-h-screen flex-col px-[6vw] pt-[10vh] pb-[8vh] lg:sticky lg:top-0 lg:pt-[16vh] lg:pr-[13vw] lg:pl-[4vw]">
          <div
            data-reveal
            className="text-[11px] font-light tracking-brand text-ink-55 uppercase"
          >
            <Link href="/collection" className="transition-opacity hover:opacity-60">
              Collection
            </Link>
            {product.category && (
              <>
                <span className="px-2.5">/</span>
                <Link
                  href={`/collection?category=${product.category.slug}`}
                  className="transition-opacity hover:opacity-60"
                >
                  {product.category.name}
                </Link>
              </>
            )}
          </div>

          <h1
            data-reveal
            className="mt-[4vh] font-display text-[clamp(40px,5vw,88px)] leading-[1.05] font-semibold tracking-[0.05em] uppercase"
          >
            {product.name}
          </h1>

          {product.description && (
            <p
              data-reveal
              className="mt-[4vh] max-w-[42ch] text-base leading-[1.8] font-light text-ink-70"
            >
              {product.description}
            </p>
          )}

          {product.specs.length > 0 && (
            <dl data-reveal className="mt-[5vh] border-t border-hairline">
              {product.specs.map((spec) => (
                <div
                  key={spec.id}
                  className="flex justify-between gap-6 border-b border-hairline py-4 text-[13px]"
                >
                  <dt className="text-[11px] font-bold tracking-brand text-ink-55 uppercase">
                    {spec.label}
                  </dt>
                  <dd className="text-right font-normal">{spec.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <a
            data-reveal
            href={`mailto:${settings.email}?subject=${subject}`}
            className="group mt-[6vh] flex items-center justify-between bg-ink px-6 py-5 text-[11px] font-bold tracking-brand text-paper uppercase transition-colors duration-300 hover:bg-acid hover:text-ink"
          >
            <span>Enquire about this object</span>
            <span className="inline-block size-[7px] bg-acid transition-colors group-hover:bg-ink" />
          </a>

          {product.leadTime && (
            <p data-reveal className="mt-[3vh] text-xs leading-[1.7] text-ink-45">
              {product.leadTime}
            </p>
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-hairline-soft bg-paper px-[6vw] pt-[14vh] pb-[10vh] md:px-[4vw]">
          <div data-reveal className="mb-[8vh] flex flex-wrap items-baseline justify-between gap-4 md:pr-[14vw]">
            <Eyebrow>
              {product.category ? `Also in ${product.category.name}` : "More objects"}
            </Eyebrow>
            <Link
              href="/collection"
              className="text-[11px] font-light tracking-brand uppercase transition-opacity hover:opacity-60"
            >
              View all
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-x-[2vw] gap-y-[6vh] sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={{
                  slug: item.slug,
                  name: item.name,
                  material: item.material,
                  image: item.images[0]
                    ? { url: item.images[0].url, alt: item.images[0].alt }
                    : null,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
