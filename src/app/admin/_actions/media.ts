"use server";

import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { saveUpload, UploadError } from "@/lib/storage";

import { fail, ok, type ActionState } from "./types";

export type UploadResult =
  | { status: "ok"; asset: typeof mediaAssets.$inferSelect }
  | { status: "error"; message: string };

/** Called from the media picker; returns the stored asset so the form can use it. */
export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  await requireUser();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { status: "error", message: "Choose a file first." };
  }

  try {
    const stored = await saveUpload(file);
    const [asset] = await db
      .insert(mediaAssets)
      .values({
        url: stored.url,
        filename: stored.filename,
        mimeType: stored.mimeType,
        width: stored.width,
        height: stored.height,
        bytes: stored.bytes,
        alt: String(formData.get("alt") ?? "") || null,
      })
      .returning();

    revalidatePath("/admin/media");
    return { status: "ok", asset };
  } catch (error) {
    const message =
      error instanceof UploadError ? error.message : "Could not process that image.";
    return { status: "error", message };
  }
}

export async function deleteMedia(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing id.");

  // The file itself is left in place: it may still be referenced by a product
  // whose row predates the media library, and object storage deletes are not
  // reversible. Only the library entry goes.
  await db.delete(mediaAssets).where(eq(mediaAssets.id, id));
  revalidatePath("/admin/media");

  return ok("Removed from the library.");
}

/** Library listing for the picker dialog. */
export async function fetchMedia() {
  await requireUser();
  return db.select().from(mediaAssets).orderBy(desc(mediaAssets.createdAt)).limit(200);
}
