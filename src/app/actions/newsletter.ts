"use server";

import { z } from "zod";

import { db } from "@/db";
import { subscribers } from "@/db/schema";

const schema = z.object({
  email: z.string().trim().min(1, "Enter an email address.").email("That does not look like an email address."),
});

export type NewsletterState = { status: "idle" | "ok" | "error"; message?: string };

export async function subscribe(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const parsed = schema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Invalid email." };
  }

  try {
    // Re-subscribing is a no-op rather than an error the visitor has to read.
    await db.insert(subscribers).values({ email: parsed.data.email }).onConflictDoNothing();
  } catch {
    return { status: "error", message: "Could not save that right now. Please try again." };
  }

  return { status: "ok", message: "Thank you — you're on the list." };
}
