import Image from "next/image";
import Link from "next/link";

import { Eyebrow } from "@/components/site/eyebrow";
import { HeroSlider } from "@/components/site/hero-slider";
import { Marquee } from "@/components/site/marquee";
import { ProductCard } from "@/components/site/product-card";
import {
  getCategories,
  getFeaturedProducts,
  getHeroSlides,
  getLookbook,
  getPublishedProducts,
  getSettings,
} from "@/lib/queries";

/** Staggered frames keep the masonry from reading as a plain grid. */
const RATIOS = ["4/5", "1/1", "3/4", "16/11", "4/5", "5/4", "3/4", "1/1"];

const LOOKBOOK_HEIGHT = {
  small: "h-[32vh] md:h-[46vh]",
  medium: "h-[38vh] md:h-[52vh]",
  large: "h-[44vh] md:h-[58vh]",
} as const;

export default async function HomePage() {
  const [slides, settings, featured, all, categories, lookbook] = await Promise.all([
    getHeroSlides(),
    getSettings(),
    getFeaturedProducts(),
    getPublishedProducts(),
    getCategories(),
    getLookbook(),
  ]);

  // Fall back to the catalogue when nothing has been flagged as featured yet.
  const selected = (featured.length > 0 ? featured : all).slice(0, 8);

  const byCategory = categories.map((category) => ({
    ...category,
    products: all.filter((product) => product.categoryId === category.id),
  }));

  return (
    <>
      <HeroSlider
        autoplay={settings.heroAutoplay}
        slides={slides.map((slide) => ({
          id: slide.id,
          url: slide.url,
          alt: slide.alt ?? "",
          caption: slide.caption,
          href: slide.product ? `/product/${slide.product.slug}` : null,
        }))}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Manifesto                                                        */}
      {/* ---------------------------------------------------------------- */}
      <section id="about" className="bg-paper px-[6vw] pt-[18vh] pb-[16vh] md:px-[3vw]">
        <Eyebrow data-reveal className="mb-[5vh]">
          {settings.aboutEyebrow}
        </Eyebrow>
        <h2
          data-reveal
          className="max-w-[26ch] font-display text-[clamp(28px,3.4vw,58px)] leading-[1.28] font-light tracking-[0.05em] uppercase"
        >
          {settings.aboutHeading}
        </h2>
        {/* The right gutter keeps this clear of the header's fixed acid bars. */}
        <div className="mt-[8vh] flex justify-end md:pr-[14vw]">
          <p
            data-reveal
            className="max-w-[44ch] text-[15px] leading-[1.85] font-light text-ink-70"
          >
            {settings.aboutBody}
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Selected objects — masonry                                       */}
      {/* ---------------------------------------------------------------- */}
      {selected.length > 0 && (
        <section className="border-t border-hairline-soft bg-paper px-[6vw] py-[12vh] md:px-[3vw]">
          <div data-reveal className="mb-[7vh] flex items-baseline justify-between gap-4 md:pr-[14vw]">
            <h2 className="font-display text-[clamp(16px,1.4vw,22px)] font-bold tracking-[0.22em] uppercase">
              Selected objects
            </h2>
            <Link
              href="/collection"
              className="shrink-0 text-[10px] font-light tracking-wider-brand uppercase transition-opacity hover:opacity-60"
            >
              View all
            </Link>
          </div>

          <div className="columns-1 gap-[2vw] sm:columns-2 lg:columns-3">
            {selected.map((product, i) => (
              <ProductCard
                key={product.id}
                ratio={RATIOS[i % RATIOS.length]}
                className="mb-[6vw] sm:mb-[2vw]"
                product={{
                  slug: product.slug,
                  name: product.name,
                  material: product.material,
                  image: product.images[0]
                    ? { url: product.images[0].url, alt: product.images[0].alt }
                    : null,
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Index                                                            */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-paper pb-[12vh] text-ink">
        {settings.showMarquee && settings.marqueeText && <Marquee text={settings.marqueeText} />}

        <div className="px-[6vw] pt-[12vh] md:px-[3vw]">
          <h2
            data-reveal
            className="mb-[8vh] font-display text-[clamp(28px,3.4vw,60px)] leading-none font-semibold tracking-[0.08em] uppercase"
          >
            Index
          </h2>

          <div className="grid grid-cols-1 gap-x-[2vw] gap-y-[5vh] sm:grid-cols-2 lg:grid-cols-4">
            {byCategory.map((category, i) => (
              <div key={category.id} data-reveal className="border-t border-ink/20 pt-5">
                <h3 className="mb-5.5 text-[10px] font-bold tracking-wider-brand text-ink-45 uppercase">
                  {String(i + 1).padStart(2, "0")} — {category.name}
                </h3>
                <div className="flex flex-col gap-3 text-[11px] font-light tracking-[0.18em] uppercase">
                  {category.products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="transition-opacity hover:opacity-50"
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Lookbook — scrubs sideways as the page scrolls                   */}
      {/* ---------------------------------------------------------------- */}
      {lookbook.length > 0 && (
        <section className="overflow-hidden border-t border-hairline-soft bg-paper pt-[12vh] pb-[14vh]">
          <Eyebrow data-reveal className="mb-[6vh] px-[6vw] md:px-[3vw]">
            Lookbook — {new Date().getFullYear()}
          </Eyebrow>
          <div
            data-look-track
            className="flex w-max items-end gap-[4vw] pl-[6vw] md:gap-[2vw] md:pl-[3vw]"
          >
            {lookbook.map((item) => (
              <Image
                key={item.id}
                src={item.url}
                alt={item.alt ?? ""}
                width={item.width}
                height={item.height}
                sizes="(max-width: 768px) 70vw, 40vw"
                className={`w-auto max-w-none object-cover ${LOOKBOOK_HEIGHT[item.size]}`}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
