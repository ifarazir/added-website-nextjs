import "server-only";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { slugify } from "./utils";

export type StoredFile = {
  url: string;
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  bytes: number;
};

const MAX_WIDTH = 2400;
const MAX_BYTES = 12 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"]);

export class UploadError extends Error {}

/** The slice of @aws-sdk/client-s3 the S3 driver actually uses. */
type S3Module = {
  S3Client: new (config: Record<string, unknown>) => { send(command: unknown): Promise<unknown> };
  PutObjectCommand: new (input: Record<string, unknown>) => unknown;
};

/**
 * Normalises an uploaded image: strips EXIF, auto-rotates, caps the long edge
 * and re-encodes to WebP. Returns the metadata the media library stores.
 */
export async function saveUpload(file: File): Promise<StoredFile> {
  if (!ALLOWED.has(file.type)) {
    throw new UploadError(`Unsupported file type: ${file.type || "unknown"}.`);
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError(`File is too large (max ${MAX_BYTES / 1024 / 1024} MB).`);
  }

  const input = Buffer.from(await file.arrayBuffer());
  const processed = await sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82, effort: 5 })
    .toBuffer({ resolveWithObject: true });

  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "image";
  const filename = `${base}-${Date.now().toString(36)}.webp`;

  const url = await put(driver(), filename, processed.data);

  return {
    url,
    filename,
    mimeType: "image/webp",
    width: processed.info.width,
    height: processed.info.height,
    bytes: processed.info.size,
  };
}

type Driver = "local" | "blob" | "s3";

function driver(): Driver {
  const configured = process.env.STORAGE_DRIVER;
  if (configured === "s3" || configured === "blob" || configured === "local") return configured;

  // Vercel's filesystem is ephemeral, so a deployment that has a Blob token but
  // no explicit choice would otherwise write files that vanish on redeploy.
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

function put(target: Driver, filename: string, data: Buffer) {
  if (target === "s3") return putToS3(filename, data);
  if (target === "blob") return putToBlob(filename, data);
  return putToDisk(filename, data);
}

/**
 * Vercel Blob. The token is injected automatically once a Blob store is
 * connected to the project, so nothing else needs configuring.
 */
async function putToBlob(filename: string, data: Buffer) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new UploadError(
      "STORAGE_DRIVER is \"blob\" but BLOB_READ_WRITE_TOKEN is not set. Connect a Blob store to the project.",
    );
  }

  const { put: putBlob } = await import("@vercel/blob");
  const result = await putBlob(`media/${filename}`, data, {
    access: "public",
    contentType: "image/webp",
    token,
    // The filename already carries a unique suffix.
    addRandomSuffix: false,
  });

  return result.url;
}

/**
 * Local-disk driver.
 *
 * Files deliberately do NOT go in public/: Next.js builds its static file map
 * when the server boots, so anything written there after startup 404s until a
 * restart. They are written to UPLOAD_DIR instead and served at runtime by
 * app/uploads/[...path]/route.ts — which also makes the directory easy to
 * mount as a volume.
 */
async function putToDisk(filename: string, data: Buffer) {
  await mkdir(uploadDir(), { recursive: true });
  await writeFile(path.join(uploadDir(), filename), data);
  return `/uploads/${filename}`;
}

export function uploadDir() {
  return process.env.UPLOAD_DIR
    ? path.resolve(process.env.UPLOAD_DIR)
    : path.join(process.cwd(), "uploads");
}

/**
 * S3 / R2 driver. The SDK is imported lazily so a local-disk deployment never
 * pays for it — install it with `npm i @aws-sdk/client-s3` before switching
 * STORAGE_DRIVER to "s3".
 */
async function putToS3(filename: string, data: Buffer) {
  const { S3_BUCKET, S3_REGION, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL } =
    process.env;

  if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    throw new UploadError(
      "STORAGE_DRIVER is \"s3\" but S3_BUCKET / S3_ACCESS_KEY_ID / S3_SECRET_ACCESS_KEY are not all set.",
    );
  }

  // The specifier is held in a variable so TypeScript does not try to resolve
  // the module at compile time — it is genuinely optional.
  const specifier = "@aws-sdk/client-s3";
  let sdk: S3Module;
  try {
    sdk = (await import(/* webpackIgnore: true */ specifier)) as S3Module;
  } catch {
    throw new UploadError(
      "The S3 storage driver needs @aws-sdk/client-s3. Run: npm i @aws-sdk/client-s3",
    );
  }
  const { S3Client, PutObjectCommand } = sdk;

  const client = new S3Client({
    region: S3_REGION ?? "auto",
    endpoint: S3_ENDPOINT,
    credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY },
  });

  const key = `media/${filename}`;
  await client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: data,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const base = S3_PUBLIC_URL?.replace(/\/$/, "") ?? `${S3_ENDPOINT?.replace(/\/$/, "")}/${S3_BUCKET}`;
  return `${base}/${key}`;
}
