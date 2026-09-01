import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { PlaceholderTile } from "./placeholder-tile";

export type ProductCardData = {
  slug: string;
  name: string;
  material: string | null;
  categoryName?: string | null;
  image: { url: string; alt: string | null } | null;
};

/**
 * One object in a grid. `ratio` lets the homepage stagger its masonry columns
 * while /collection keeps every tile on the same 4:5 frame.
 */
export function ProductCard({
  product,
  ratio = "4/5",
  index,
  showCategory = false,
  className,
}: {
  product: ProductCardData;
  ratio?: string;
  index?: number;
  showCategory?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/product/${product.slug}`}
      data-reveal
      className={cn("group block break-inside-avoid", className)}
    >
      <div data-plx className="relative overflow-hidden bg-shade" style={{ aspectRatio: ratio }}>
        {product.image ? (
          <Image
            src={product.image.url}
            alt={product.image.alt ?? product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="scale-[1.12] object-cover transition-transform duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.16]"
          />
        ) : (
          <PlaceholderTile label={product.name} />
        )}
        {index !== undefined && (
          <span className="absolute top-3.5 left-3.5 text-[10px] font-light tracking-brand text-ink-55">
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="mt-3.5 flex items-baseline justify-between gap-3 text-[10px] tracking-wide-brand uppercase">
        <span>{product.name}</span>
        <span className="text-right text-ink-40">{product.material}</span>
      </div>
      {showCategory && product.categoryName && (
        <div className="mt-1 text-[11px] font-light tracking-brand text-ink-40 uppercase">
          {product.categoryName}
        </div>
      )}
    </Link>
  );
}
