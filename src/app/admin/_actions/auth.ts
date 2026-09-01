"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/db";
import { users } from "@/db/schema";
import {
  createSession,
  destroySession,
  findUserByEmail,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema, passwordSchema } from "@/lib/validators";

import { fail, fieldErrors, ok, type ActionState } from "./types";

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return fail("Check the form.", fieldErrors(parsed.error.issues));
  }

  const user = await findUserByEmail(parsed.data.email);
  // Same message either way — never reveal whether the address exists.
  const valid = user ? await verifyPassword(parsed.data.password, user.passwordHash) : false;

  if (!user || !valid) {
    return fail("Those details do not match an account.");
  }

  await createSession({ sub: user.id, email: user.email, name: user.name, role: user.role });

  const next = String(formData.get("next") ?? "/admin");
  // Only ever bounce back into the admin — an attacker-supplied absolute URL
  // would otherwise turn this into an open redirect.
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await destroySession();
  revalidatePath("/admin");
  redirect("/admin/login");
}

export async function changePassword(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!(await verifyPassword(current, user.passwordHash))) {
    return fail("Your current password is not right.", { current: "Incorrect password." });
  }

  const parsed = passwordSchema.safeParse(next);
  if (!parsed.success) {
    return fail("Check the new password.", { next: parsed.error.issues[0].message });
  }
  if (next !== confirm) {
    return fail("The two new passwords do not match.", { confirm: "These do not match." });
  }

  await db
    .update(users)
    .set({ passwordHash: await hashPassword(next) })
    .where(eq(users.id, user.id));

  return ok("Password changed.");
}
