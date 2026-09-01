"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";

import { db } from "@/db";
import { heroSlides, lookbookItems, siteSettings, subscribers } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/queries";
import { heroSlideSchema, lookbookSchema, settingsSchema } from "@/lib/validators";

import { fail, fieldErrors, ok, type ActionState } from "./types";

const bool = (formData: FormData, key: string) =>
  formData.get(key) === "on" || formData.get(key) === "true";

function refresh(path: string) {
  revalidateTag(CONTENT_TAG);
  revalidatePath(path);
}

/* -------------------------------------------------------------------------- */
/*  Hero slides                                                               */
/* -------------------------------------------------------------------------- */

export async function saveHeroSlide(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const parsed = heroSlideSchema.safeParse({
    url: formData.get("url"),
    alt: formData.get("alt"),
    caption: formData.get("caption"),
    productId: formData.get("productId") ? String(formData.get("productId")) : null,
    position: formData.get("position") ?? 0,
    active: bool(formData, "active"),
  });

  if (!parsed.success) return fail("Check the form.", fieldErrors(parsed.error.issues));

  if (id) {
    await db.update(heroSlides).set(parsed.data).where(eq(heroSlides.id, id));
  } else {
    await db.insert(heroSlides).values(parsed.data);
  }

  refresh("/admin/hero");
  return ok(id ? "Slide saved." : "Slide added.");
}

export async function deleteHeroSlide(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing slide id.");

  await db.delete(heroSlides).where(eq(heroSlides.id, id));
  refresh("/admin/hero");
  return ok("Slide removed.");
}

/* -------------------------------------------------------------------------- */
/*  Lookbook                                                                  */
/* -------------------------------------------------------------------------- */

export async function saveLookbookItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  const parsed = lookbookSchema.safeParse({
    url: formData.get("url"),
    alt: formData.get("alt"),
    width: formData.get("width") || 1200,
    height: formData.get("height") || 1500,
    size: formData.get("size") ?? "medium",
    position: formData.get("position") ?? 0,
    active: bool(formData, "active"),
  });

  if (!parsed.success) return fail("Check the form.", fieldErrors(parsed.error.issues));

  if (id) {
    await db.update(lookbookItems).set(parsed.data).where(eq(lookbookItems.id, id));
  } else {
    await db.insert(lookbookItems).values(parsed.data);
  }

  refresh("/admin/lookbook");
  return ok(id ? "Frame saved." : "Frame added.");
}

export async function deleteLookbookItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing item id.");

  await db.delete(lookbookItems).where(eq(lookbookItems.id, id));
  refresh("/admin/lookbook");
  return ok("Frame removed.");
}

/* -------------------------------------------------------------------------- */
/*  Settings                                                                  */
/* -------------------------------------------------------------------------- */

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser();

  const parsed = settingsSchema.safeParse({
    aboutEyebrow: formData.get("aboutEyebrow"),
    aboutHeading: formData.get("aboutHeading"),
    aboutBody: formData.get("aboutBody"),
    collaborationsHeading: formData.get("collaborationsHeading"),
    collaborationsBody: formData.get("collaborationsBody"),
    marqueeText: formData.get("marqueeText"),
    showMarquee: bool(formData, "showMarquee"),
    heroAutoplay: bool(formData, "heroAutoplay"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    instagram: formData.get("instagram"),
    pinterest: formData.get("pinterest"),
    city: formData.get("city"),
  });

  if (!parsed.success) return fail("Check the form.", fieldErrors(parsed.error.issues));

  await db
    .insert(siteSettings)
    .values({ id: "singleton", ...parsed.data })
    .onConflictDoUpdate({ target: siteSettings.id, set: parsed.data });

  refresh("/admin/settings");
  return ok("Settings saved.");
}

/* -------------------------------------------------------------------------- */
/*  Subscribers                                                               */
/* -------------------------------------------------------------------------- */

export async function deleteSubscriber(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing id.");

  await db.delete(subscribers).where(eq(subscribers.id, id));
  revalidatePath("/admin/subscribers");
  return ok("Subscriber removed.");
}
