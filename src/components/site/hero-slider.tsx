"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { Wordmark } from "./wordmark";

export type HeroSlideData = {
  id: string;
  url: string;
  alt: string;
  caption: string | null;
  href: string | null;
};

const INTERVAL = 5200;

/**
 * Full-bleed cinematic slideshow. Slides crossfade while the incoming frame
 * eases out of a slight scale — the ken-burns drift from the design — and the
 * whole thing degrades to a single static frame under reduced motion.
 */
export function HeroSlider({
  slides,
  autoplay = true,
}: {
  slides: HeroSlideData[];
  autoplay?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const reduced = useRef(false);
  const gsapRef = useRef<typeof import("gsap").gsap | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  /** The slide currently painted, so the effect knows what to fade out. */
  const shownRef = useRef(0);

  useEffect(() => {
    reduced.current = prefersReducedMotion();
    if (reduced.current) return;
    let cancelled = false;
    import("gsap").then(({ gsap }) => {
      if (cancelled) return;
      gsapRef.current = gsap;
      const first = rootRef.current?.querySelector<HTMLElement>("[data-slide='0'] img");
      if (first) gsap.fromTo(first, { scale: 1.1 }, { scale: 1, duration: 2.4, ease: "power2.out" });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length < 2) return;
      setIndex((current) => {
        const target = (next + slides.length) % slides.length;
        return target === current ? current : target;
      });
    },
    [slides.length],
  );

  // The crossfade is driven by the committed index rather than from inside the
  // state updater: React is free to call an updater more than once, which ran
  // the animation for a transition that was never committed and left the
  // caption a slide ahead of the photograph.
  useEffect(() => {
    const previous = shownRef.current;
    shownRef.current = index;

    if (previous === index) return;

    const gsap = gsapRef.current;
    const root = rootRef.current;
    if (!gsap || !root || reduced.current) return;

    const from = root.querySelector<HTMLElement>(`[data-slide="${previous}"]`);
    const to = root.querySelector<HTMLElement>(`[data-slide="${index}"]`);

    if (from) gsap.to(from, { opacity: 0, duration: 1.1, ease: "power2.inOut" });
    if (to) {
      gsap.fromTo(to, { opacity: 0 }, { opacity: 1, duration: 1.1, ease: "power2.inOut" });
      const img = to.querySelector("img");
      if (img) gsap.fromTo(img, { scale: 1.07 }, { scale: 1, duration: 7, ease: "power1.out" });
    }
  }, [index]);

  useEffect(() => {
    if (!autoplay || slides.length < 2 || reduced.current) return;
    const timer = window.setInterval(() => goTo(index + 1), INTERVAL);
    return () => window.clearInterval(timer);
  }, [autoplay, goTo, index, slides.length]);

  if (slides.length === 0) {
    return <section data-hero className="h-screen bg-shade" aria-hidden />;
  }

  const active = slides[index];

  return (
    <section
      ref={rootRef}
      data-hero
      aria-roledescription="carousel"
      aria-label="Featured objects"
      className="relative h-screen overflow-hidden bg-[#eceae6]"
    >
      {slides.map((slide, i) => {
        const frame = (
          <Image
            src={slide.url}
            alt={slide.alt}
            fill
            sizes="100vw"
            priority={i === 0}
            className="object-cover"
          />
        );
        return (
          <div
            key={slide.id}
            data-slide={i}
            aria-hidden={i !== index}
            className={cn(
              "absolute inset-0",
              // GSAP owns opacity once it loads; these are the pre-JS values.
              i === index ? "opacity-100" : "opacity-0",
            )}
          >
            {slide.href ? (
              <Link href={slide.href} tabIndex={i === index ? 0 : -1} className="block h-full w-full">
                {frame}
              </Link>
            ) : (
              frame
            )}
          </div>
        );
      })}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/30 from-0% to-transparent to-30%"
      />

      {/* Cropped off the bottom-right corner, exactly as in the sample. */}
      <Wordmark className="pointer-events-none absolute right-[5vw] bottom-[14vh] w-[68vw] fill-paper md:right-[3vw] md:bottom-[4vh] md:w-[56vw]" />

      <div className="pointer-events-none absolute bottom-[34px] left-[6vw] flex flex-col gap-4 text-paper md:left-[3vw]">
        <p className="max-w-[70vw] text-[10px] font-light tracking-wider-brand uppercase opacity-85">
          {active.caption}
        </p>
        {slides.length > 1 && (
          <div className="pointer-events-auto flex gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Show slide ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "h-[2px] w-[26px] cursor-pointer bg-paper transition-opacity duration-300",
                  i === index ? "opacity-100" : "opacity-35",
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
