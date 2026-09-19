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
  email: string;
};

/**
 * The scattered header from the brand sample: a corner mark and PRODUCTS
 * floating at the left, and a right-hand stack of acid-yellow bars. Nothing
 * sits in a bar across the top — the type just hangs over the page.
 */
export function SiteHeader({ groups, phone, instagram, email }: Props) {
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

  // A tight highlight around the word, as on the brand's own page — not a deep
  // box with the type floating in it. Both paddings are corrected so the word
  // lands in the middle of the bar: the right one gives back the letter-space
  // that the 0.35em tracking adds after the last letter, and the bottom one
  // makes up the 0.05em by which Manrope hangs its capitals above the baseline
  // centre. Without either, the type sits high and hard to the left.
  const bar =
    "bg-acid pt-[2px] pb-[calc(2px+0.05em)] pl-[8px] pr-[calc(8px-0.35em)] leading-none text-ink transition-opacity hover:opacity-70";

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
        <LogoBlocks className={cn("transition-opacity duration-300", open && "opacity-75")} />
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
        className="no-scrollbar pointer-events-auto absolute top-[24vh] left-[6vw] flex max-h-[62vh] flex-col gap-[26px] overflow-y-auto pr-4 text-[11px] leading-[1.25] tracking-widest-brand uppercase md:top-[30vh] md:left-[3vw]"
      >
        {/* The lines of a category sit right under each other, with a blank
            line's worth of air between one category and the next. */}
        {groups.map((group, gi) => (
          <nav key={group.label} className="flex flex-col items-start gap-[1px]">
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

      <nav className="pointer-events-auto absolute top-[8.5vh] right-[4vw] flex flex-col items-end gap-[1.4vh] text-right text-[9px] font-normal tracking-widest-brand uppercase md:right-[1.4vw] md:gap-[1.9vh] md:text-[11px]">
        <Link href="/search" className={bar}>
          Search
        </Link>
        <a href="#login" className={bar}>
          Log In
        </a>

        {open ? (
          // With the menu open the two lower links collapse into one solid
          // block carrying the studio's contact details, as in the sample: the
          // number runs as one unbroken string behind its WhatsApp mark, and
          // the handle behind the Instagram one.
          <div className="flex flex-col items-end gap-[6px] bg-acid py-[10px] pl-[14px] pr-[calc(14px-0.35em)] leading-none text-ink">
            <Link href="/#contact" className="transition-opacity hover:opacity-70">
              Contact Us
            </Link>
            <a
              href={`tel:${phone.replace(/[^+\d]/g, "")}`}
              className="flex items-center gap-[6px] transition-opacity hover:opacity-70"
            >
              <WhatsAppMark />
              <span className="tracking-[0.15em]">{phone.replace(/[^+\d]/g, "")}</span>
            </a>
            <a
              href={`https://instagram.com/${instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-[6px] transition-opacity hover:opacity-70"
            >
              <InstagramMark />
              {instagram.replace(/^@/, "")}
            </a>
          </div>
        ) : (
          <>
            {/* The collaborations section was folded away with the rest of the
                long home page; the bar now opens an enquiry straight away. */}
            <a
              href={`mailto:${email}?subject=${encodeURIComponent("Collaboration enquiry")}`}
              className={bar}
            >
              Collaborations
            </a>
            <Link href="/#contact" className={bar}>
              Contact Us
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

/** Sits in front of the phone number in the open menu, as in the sample. */
function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-[1.25em] shrink-0 fill-current">
      <path d="M12 2.2A9.7 9.7 0 0 0 3.6 16.8L2.4 21.6l4.9-1.2A9.7 9.7 0 1 0 12 2.2Zm0 1.6a8.1 8.1 0 1 1-4.2 15l-.3-.2-2.9.7.7-2.8-.2-.3A8.1 8.1 0 0 1 12 3.8Zm-3.5 4c-.2 0-.4 0-.6.3-.2.3-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.6 4 3.5 1.9.8 2.3.6 2.7.6.4 0 1.3-.5 1.5-1.1.2-.5.2-1 .1-1.1l-.5-.3-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-.9-.4-1.7-1-.6-.6-1-1.2-1.2-1.4-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.7-1.6c-.2-.4-.3-.4-.5-.4h-.4Z" />
    </svg>
  );
}

/** Sits in front of the Instagram handle in the open menu. */
function InstagramMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-[1.25em] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.1" cy="6.9" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
