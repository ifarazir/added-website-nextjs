import { Eyebrow } from "@/components/site/eyebrow";
import { HeroSlider } from "@/components/site/hero-slider";
import { Marquee } from "@/components/site/marquee";
import { organisationSchema, StructuredData } from "@/components/site/structured-data";
import { getHeroSlides, getSettings } from "@/lib/queries";

/**
 * Deliberately short: the hero, the manifesto and the contact footer. The
 * catalogue lives behind the PRODUCTS menu and /collection rather than being
 * unrolled down the home page.
 */
export default async function HomePage() {
  const [slides, settings] = await Promise.all([getHeroSlides(), getSettings()]);

  return (
    <>
      <StructuredData data={organisationSchema(settings)} />

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
      <section id="about" className="scroll-mt-[32vh] bg-paper px-[6vw] pt-[18vh] pb-[16vh] md:pr-[3vw] md:pl-[9vw]">
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
      {/* Marquee band — the one heavy strip between the manifesto and the  */}
      {/* footer                                                           */}
      {/* ---------------------------------------------------------------- */}
      {settings.showMarquee && settings.marqueeText && (
        <section className="bg-paper pb-[8vh] text-ink">
          <Marquee text={settings.marqueeText} />
        </section>
      )}
    </>
  );
}
