"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { PlaceholderTile } from "./placeholder-tile";

export type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};

/**
 * The product's image column, and the full-screen viewer behind it.
 *
 * The column itself is unchanged from the static version — a tall lead frame
 * with the remaining shots stacked under it — so the page still reads as an
 * editorial spread. Clicking any frame opens it large, which is what a
 * catalogue with no prices is really for.
 */
export function ProductGallery({
  images,
  productName,
}: {
  images: GalleryImage[];
  productName: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const step = useCallback(
    (delta: number) =>
      setOpenAt((current) =>
        current === null ? current : (current + delta + images.length) % images.length,
      ),
    [images.length],
  );

  // Radix handles Escape; the arrows are ours.
  useEffect(() => {
    if (openAt === null || images.length < 2) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openAt, images.length, step]);

  if (images.length === 0) {
    return (
      <div className="relative h-[60vh] overflow-hidden bg-shade lg:h-screen">
        <PlaceholderTile label={productName} />
      </div>
    );
  }

  const [lead, ...rest] = images;
  const active = openAt === null ? null : images[openAt];

  return (
    <>
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          onClick={() => setOpenAt(0)}
          aria-label={`Open ${lead.alt ?? productName} full screen`}
          className="group relative block h-[60vh] w-full cursor-zoom-in overflow-hidden bg-shade lg:h-screen"
        >
          <Image
            src={lead.url}
            alt={lead.alt ?? productName}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        </button>

        {rest.map((image, i) => (
          <button
            key={image.id}
            type="button"
            data-plx
            onClick={() => setOpenAt(i + 1)}
            aria-label={`Open ${image.alt ?? productName} full screen`}
            className="relative block h-[50vh] w-full cursor-zoom-in overflow-hidden bg-shade lg:h-[70vh]"
          >
            <Image
              src={image.url}
              alt={image.alt ?? productName}
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      <Dialog.Root open={openAt !== null} onOpenChange={(open) => !open && setOpenAt(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-100 bg-paper" />
          <Dialog.Content
            aria-label={`${productName} — image viewer`}
            className="fixed inset-0 z-100 flex flex-col outline-none"
          >
            <Dialog.Title className="sr-only">{productName}</Dialog.Title>

            <div className="flex items-center justify-between px-[6vw] py-[3vh] md:px-[3vw]">
              <span className="text-[10px] font-light tracking-wider-brand text-ink-45 uppercase">
                {productName}
                {images.length > 1 && active && (
                  <span className="ml-4 tabular-nums">
                    {String(openAt! + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
                  </span>
                )}
              </span>

              <Dialog.Close className="cursor-pointer text-[10px] font-bold tracking-wider-brand uppercase transition-opacity hover:opacity-60">
                Close
              </Dialog.Close>
            </div>

            {active && (
              <div className="relative min-h-0 flex-1">
                <Image
                  key={active.id}
                  src={active.url}
                  alt={active.alt ?? productName}
                  fill
                  sizes="100vw"
                  className="object-contain px-[6vw] pb-[3vh] md:px-[3vw]"
                />
              </div>
            )}

            {images.length > 1 && (
              <div className="flex items-center justify-between px-[6vw] py-[3vh] md:px-[3vw]">
                <button
                  type="button"
                  onClick={() => step(-1)}
                  className="cursor-pointer text-[10px] font-light tracking-wider-brand uppercase transition-opacity hover:opacity-60"
                >
                  ← Previous
                </button>
                <button
                  type="button"
                  onClick={() => step(1)}
                  className="cursor-pointer text-[10px] font-light tracking-wider-brand uppercase transition-opacity hover:opacity-60"
                >
                  Next →
                </button>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
