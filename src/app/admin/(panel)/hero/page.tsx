import { HeroSlideCard } from "@/components/admin/hero-slide-card";
import { listHeroSlides, listProductOptions } from "@/lib/admin-queries";

export const metadata = { title: "Hero slides" };

export default async function HeroPage() {
  const [slides, products] = await Promise.all([listHeroSlides(), listProductOptions()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hero slides</h1>
        <p className="text-sm text-muted-foreground">
          The full-bleed slideshow at the top of the homepage. Slides crossfade in position order.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {slides.map((slide) => (
          <HeroSlideCard
            key={slide.id}
            products={products}
            slide={{
              id: slide.id,
              url: slide.url,
              alt: slide.alt,
              caption: slide.caption,
              productId: slide.productId,
              position: slide.position,
              active: slide.active,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Add a slide</h2>
        <HeroSlideCard products={products} />
      </div>
    </div>
  );
}
