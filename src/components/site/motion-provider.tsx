"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { prefersReducedMotion } from "@/lib/motion";

/**
 * Single owner of the site's GSAP timeline. Mounted once in the site layout,
 * it wires the scroll reveals, the image parallax and the lookbook scrub, then
 * tears its own triggers down on navigation so nothing leaks between routes.
 *
 * When the visitor asks for reduced motion nothing is registered at all and
 * `motion-ready` never lands on <html>, which leaves every [data-reveal]
 * element at its natural opacity.
 */
export function MotionProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion()) return;

    let cancelled = false;
    const tweens: gsap.core.Tween[] = [];
    let ScrollTriggerRef: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      ScrollTriggerRef = ScrollTrigger;
      document.documentElement.classList.add("motion-ready");

      const q = (selector: string) => Array.from(document.querySelectorAll<HTMLElement>(selector));

      for (const el of q("[data-reveal]")) {
        tweens.push(
          gsap.fromTo(
            el,
            { y: 42, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.1,
              ease: "power3.out",
              immediateRender: false,
              scrollTrigger: { trigger: el, start: "top 90%" },
            },
          ),
        );
      }

      // Slow vertical drift inside each fixed-ratio image frame.
      for (const frame of q("[data-plx]")) {
        const img = frame.querySelector("img");
        if (!img) continue;
        tweens.push(
          gsap.fromTo(
            img,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: "none",
              scrollTrigger: { trigger: frame, scrub: true, start: "top bottom", end: "bottom top" },
            },
          ),
        );
      }

      const track = document.querySelector<HTMLElement>("[data-look-track]");
      if (track) {
        tweens.push(
          gsap.to(track, {
            x: () => -Math.max(0, track.scrollWidth - window.innerWidth * 0.92),
            ease: "none",
            scrollTrigger: { trigger: track, scrub: 1, start: "top bottom", end: "bottom top" },
          }),
        );
      }

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      for (const tween of tweens) {
        tween.scrollTrigger?.kill(true);
        tween.kill();
      }
      ScrollTriggerRef?.refresh();
    };
  }, [pathname]);

  return null;
}
