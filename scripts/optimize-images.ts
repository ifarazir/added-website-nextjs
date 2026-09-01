/**
 * Turns the raw brand photography into web-ready assets under public/images.
 *
 * The originals (3122x3467 JPEGs, 6-9 MB each) are far too heavy to ship, and a
 * few of the hero frames only exist as ~1000px extracts from the brand PDF, so
 * every source is capped rather than resized to a fixed width — nothing is ever
 * upscaled past what the source actually holds.
 *
 * Usage:  SOURCE_DIR=/path/to/originals npm run images:build
 */
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR =
  process.env.SOURCE_DIR ?? path.resolve(process.cwd(), "../repo/project/uploads");
const OUT_DIR = path.resolve(process.cwd(), "public/images");

type Source = {
  slug: string;
  /** Pixels to trim off the right edge before anything else. */
  trimRight?: number;
};

/** source file -> how it gets published */
const MAP: Record<string, Source> = {
  "web-donut-hand.jpg": { slug: "donut-hand" },
  "web-jooje-sand.jpg": { slug: "jooje-sand" },
  "web-colander.jpg": { slug: "ufo-colander" },
  "web-jooje-paint.jpg": { slug: "jooje-sphere" },
  // This one is a screenshot of an Instagram post and carries the carousel's
  // next-arrow baked into the right edge. Trimmed off before publishing.
  "comb-editorial.png": { slug: "lior-comb", trimRight: 80 },
  "Asset 1.jpg": { slug: "modular-shelf" },
  "Asset 2.jpg": { slug: "wireframe" },
  "Asset 4.jpg": { slug: "donut" },
  "Asset 5.jpg": { slug: "st-table" },
};

// The originals are 3122px wide and are used full-bleed in the hero, which on
// a 1440px viewport at 2x needs ~2880px. Nothing is ever enlarged past its
// source, so the PDF-derived frames stay at their native ~1000px.
const MAX_WIDTH = 3200;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const available = new Set(await readdir(SOURCE_DIR));
  const manifest: Record<string, { width: number; height: number; blur: string }> = {};

  for (const [file, source] of Object.entries(MAP)) {
    const { slug, trimRight = 0 } = source;

    if (!available.has(file)) {
      console.warn(`! missing source: ${file}`);
      continue;
    }
    const input = path.join(SOURCE_DIR, file);
    const meta = await sharp(input).metadata();
    const sourceWidth = (meta.width ?? MAX_WIDTH) - trimRight;
    const width = Math.min(sourceWidth, MAX_WIDTH);

    const pipeline = () => {
      const base = sharp(input).rotate();
      if (trimRight) {
        base.extract({
          left: 0,
          top: 0,
          width: sourceWidth,
          height: meta.height ?? 0,
        });
      }
      return base.resize({ width, withoutEnlargement: true });
    };

    // One JPEG source per image: next/image negotiates AVIF/WebP per request,
    // so shipping extra formats would only double the repository weight.
    const jpg = await pipeline()
      .jpeg({ quality: 84, progressive: true, mozjpeg: true })
      .toFile(path.join(OUT_DIR, `${slug}.jpg`));

    // 20px blur placeholder, inlined as a data URI in the image manifest.
    const blur = await pipeline().resize({ width: 20 }).webp({ quality: 40 }).toBuffer();

    manifest[slug] = {
      width: jpg.width,
      height: jpg.height,
      blur: `data:image/webp;base64,${blur.toString("base64")}`,
    };
    console.log(`✓ ${slug.padEnd(16)} ${jpg.width}x${jpg.height}  ${(jpg.size / 1024).toFixed(0)} KB`);
  }

  await writeFile(
    path.resolve(process.cwd(), "src/lib/image-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(`\nWrote ${Object.keys(manifest).length} images to public/images`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
