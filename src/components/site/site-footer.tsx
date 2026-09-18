import Link from "next/link";

import type { Settings } from "@/lib/queries";
import { cn } from "@/lib/utils";

import { Wordmark } from "./wordmark";

/** Light and minimal — the only heavy block on the page is the marquee. */
export function SiteFooter({ settings }: { settings: Settings }) {
  const column = "flex flex-col gap-3 text-[10px] tracking-wide-brand uppercase";
  const heading = "font-bold tracking-wider-brand text-ink-40";
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="scroll-mt-[32vh] border-t border-hairline bg-paper px-[6vw] pt-[7vh] pb-[3vh] md:pr-[3vw] md:pl-[9vw]"
    >
      <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr_1fr] md:gap-x-[3vw] md:gap-y-0">
        {/* The columns keep the first track empty, where the newsletter sign-up
            used to sit, so the footer still reads from the middle out. */}
        <div className={cn(column, "md:col-start-2")}>
          <span className={heading}>Products</span>
          <Link href="/collection">Collection</Link>
          <Link href="/collection?category=decorative-objects">Objects</Link>
          <Link href="/collection?category=shelving-storage">Storage</Link>
        </div>

        <div className={column}>
          <span className={heading}>Studio</span>
          <Link href="/#about">About</Link>
          <Link href="/#contact">Contact Us</Link>
          {settings.email && (
            <a
              href={`mailto:${settings.email}?subject=${encodeURIComponent("Collaboration enquiry")}`}
            >
              Collaborations
            </a>
          )}
        </div>

        <div className={column}>
          <span className={heading}>Follow</span>
          {settings.instagram && (
            <a
              href={`https://instagram.com/${settings.instagram.replace(/^@/, "")}`}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
          )}
          {settings.pinterest && (
            <a href={settings.pinterest} target="_blank" rel="noreferrer">
              Pinterest
            </a>
          )}
          {settings.phone && (
            <a href={`tel:${settings.phone.replace(/[^+\d]/g, "")}`} className="tracking-brand">
              {settings.phone}
            </a>
          )}
          {settings.email && (
            <a href={`mailto:${settings.email}`} className="tracking-[0.04em] normal-case">
              {settings.email}
            </a>
          )}
        </div>
      </div>

      <div className="mt-[8vh] flex flex-col items-center gap-5 border-t border-hairline-soft pt-4.5 text-[10px] tracking-wider-brand text-ink-40 uppercase sm:flex-row sm:justify-between sm:gap-0">
        <span>© {year} Added Forms</span>
        <Wordmark className="w-22 fill-ink/50" />
        <span>{settings.city}</span>
      </div>
    </footer>
  );
}
