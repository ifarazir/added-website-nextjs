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

/** source file -> published slug */
const MAP: Record<string, string> = {
  "web-donut-hand.jpg": "donut-hand",
  "web-jooje-sand.jpg": "jooje-sand",
  "web-colander.jpg": "ufo-colander",
  "web-jooje-paint.jpg": "jooje-sphere",
  "comb-editorial.png": "lior-comb",
  "Asset 1.jpg": "modular-shelf",
  "Asset 2.jpg": "wireframe",
  "Asset 4.jpg": "donut",
  "Asset 5.jpg": "st-table",
};

const MAX_WIDTH = 2400;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const available = new Set(await readdir(SOURCE_DIR));
  const manifest: Record<string, { width: number; height: number; blur: string }> = {};

  for (const [file, slug] of Object.entries(MAP)) {
    if (!available.has(file)) {
      console.warn(`! missing source: ${file}`);
      continue;
    }
    const input = path.join(SOURCE_DIR, file);
    const meta = await sharp(input).metadata();
    const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);

    const pipeline = () => sharp(input).rotate().resize({ width, withoutEnlargement: true });

    // One JPEG source per image: next/image negotiates AVIF/WebP per request,
    // so shipping extra formats would only double the repository weight.
    const jpg = await pipeline()
      .jpeg({ quality: 84, progressive: true, mozjpeg: true })
      .toFile(path.join(OUT_DIR, `${slug}.jpg`));

    // 20px blur placeholder, inlined as a data URI in the image manifest.
    const blur = await sharp(input).resize({ width: 20 }).webp({ quality: 40 }).toBuffer();

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
