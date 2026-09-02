"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { LogoBlocks } from "./wordmark";

export type NavGroup = {
  label: string;
  href: string;
  items: { label: string; href: string }[];
};

type Props = {
  groups: NavGroup[];
  phone: string;
  instagram: string;
};

/**
 * The scattered header from the brand sample: a corner mark and PRODUCTS
 * floating at the left, and a right-hand stack of acid-yellow bars. Nothing
 * sits in a bar across the top — the type just hangs over the page.
 */
export function SiteHeader({ groups, phone, instagram }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);

  // Over a full-bleed hero the type is white; once the white sections scroll up
  // under it, it flips to ink so it stays readable. Pages without a hero start
  // dark. The colour is driven by the real scroll position rather than a
  // one-shot trigger, so a reload half-way down the page still looks right.
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero) {
      setOnDark(false);
      return;
    }
    const apply = () => setOnDark(window.scrollY < hero.offsetHeight - 60);
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, [pathname]);

  // Close the drop-down when navigating.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const bar =
    "bg-acid px-[9px] py-[4px] text-ink transition-opacity hover:opacity-70";

  return (
    <header
      className={cn(
        "pointer-events-none fixed inset-0 z-60 transition-colors duration-300",
        onDark ? "text-paper" : "text-ink",
      )}
    >
      {/* Darkens the left edge so the open menu stays legible over photography. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-linear-to-r from-ink/60 to-transparent to-42% transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <Link
        href="/"
        aria-label="Added Forms — home"
        className="pointer-events-auto absolute top-[4.5vh] left-[6vw] md:left-[3vw]"
      >
        <LogoBlocks className={cn("transition-opacity duration-300", open && "opacity-40")} />
      </Link>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="products-menu"
        className="pointer-events-auto absolute top-[19vh] left-[6vw] cursor-pointer text-[11px] font-light tracking-widest-brand uppercase md:top-[25vh] md:left-[3vw]"
      >
        Products
      </button>

      <div
        id="products-menu"
        hidden={!open}
        className="pointer-events-auto absolute top-[24vh] left-[6vw] flex max-h-[62vh] flex-col gap-[22px] overflow-y-auto pr-4 text-[11px] tracking-widest-brand uppercase md:top-[30vh] md:left-[3vw]"
      >
        {groups.map((group, gi) => (
          <nav key={group.label} className="flex flex-col items-start gap-[9px]">
            <Link
              href={group.href}
              className="font-bold transition-opacity hover:opacity-60"
              style={{ animationDelay: `${gi * 60}ms` }}
            >
              {group.label}
            </Link>
            {group.items.map((item) => (
              <Link
                key={item.label + item.href}
                href={item.href}
                className="font-light transition-opacity hover:opacity-60"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ))}
      </div>

      <nav className="pointer-events-auto absolute top-[8.5vh] right-[4vw] flex flex-col items-end gap-[1.4vh] text-right text-[9px] font-light tracking-widest-brand uppercase md:right-[1.4vw] md:gap-[1.9vh] md:text-[11px]">
        <Link href="/search" className={bar}>
          Search
        </Link>
        <a href="#login" className={bar}>
          Log In
        </a>

        {open ? (
          // With the menu open the two lower links collapse into one solid
          // block carrying the studio's contact details, as in the sample.
          <div className="mt-[0.5vh] flex flex-col items-end gap-[1.6vh] bg-acid px-[14px] py-[16px] text-ink">
            <Link href="/#contact" className="transition-opacity hover:opacity-70">
              Contact Us
            </Link>
            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="tracking-[0.28em] transition-opacity hover:opacity-70"
            >
              {phone}
            </a>
            <a
              href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="transition-opacity hover:opacity-70"
            >
              @ {instagram.replace(/^@/, "")}
            </a>
          </div>
        ) : (
          <>
            <Link href="/#collaborations" className={bar}>
              Collaborations
            </Link>
            <Link href="/#contact" className={bar}>
              Contact Us
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
