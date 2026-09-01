import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";

import { uploadDir } from "@/lib/storage";

const CONTENT_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

/**
 * Serves locally stored uploads. public/ cannot be used because Next.js maps
 * that directory once at boot, so files written by the admin would 404 until
 * the next restart.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;

  const root = uploadDir();
  const target = path.resolve(root, ...segments);

  // Never serve outside the upload directory, whatever the URL contains.
  if (target !== root && !target.startsWith(root + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  const type = CONTENT_TYPES[path.extname(target).toLowerCase()];
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const info = await stat(target);
    if (!info.isFile()) return new Response("Not found", { status: 404 });

    const stream = Readable.toWeb(createReadStream(target)) as ReadableStream;
    return new Response(stream, {
      headers: {
        "Content-Type": type,
        "Content-Length": String(info.size),
        // Filenames carry a unique suffix, so the bytes never change.
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
