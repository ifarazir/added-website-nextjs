"use server";

import { and, count, eq, ne, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { isUniqueViolation } from "@/db/errors";
import { users } from "@/db/schema";
import { hashPassword, requireAdmin } from "@/lib/auth";
import { userCreateSchema, userUpdateSchema } from "@/lib/validators";

import { fail, fieldErrors, ok, type ActionState } from "./types";

/** True when removing or demoting this user would leave nobody in charge. */
async function isLastAdmin(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), ne(users.id, userId)));
  return row.value === 0;
}

export async function createUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();

  const parsed = userCreateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) return fail("Check the form.", fieldErrors(parsed.error.issues));

  const { password, ...values } = parsed.data;

  try {
    await db.insert(users).values({ ...values, passwordHash: await hashPassword(password) });
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail("That email already has an account.", { email: "Already in use." });
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return ok(`${values.name} can now sign in.`);
}

export async function updateUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing user id.");

  const parsed = userUpdateSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role"),
    password: formData.get("password"),
  });

  if (!parsed.success) return fail("Check the form.", fieldErrors(parsed.error.issues));

  const { password, ...values } = parsed.data;

  // Demoting the only admin would lock everyone out of user management.
  if (values.role !== "admin" && (await isLastAdmin(id))) {
    return fail("This is the last admin — promote someone else first.", {
      role: "The last admin cannot be demoted.",
    });
  }
  if (id === actor.id && values.role !== "admin") {
    return fail("You cannot remove your own admin access.", { role: "Not on your own account." });
  }

  try {
    await db
      .update(users)
      .set({ ...values, ...(password ? { passwordHash: await hashPassword(password) } : {}) })
      .where(eq(users.id, id));
  } catch (error) {
    if (isUniqueViolation(error)) {
      return fail("That email already has an account.", { email: "Already in use." });
    }
    throw error;
  }

  revalidatePath("/admin/users");
  return ok(password ? "Saved, and the password was reset." : "Saved.");
}

export async function deleteUser(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await requireAdmin();

  const id = String(formData.get("id") ?? "");
  if (!id) return fail("Missing user id.");

  // Two ways to lock the studio out of its own admin, both refused.
  if (id === actor.id) return fail("You cannot delete your own account.");
  if (await isLastAdmin(id)) return fail("That is the last admin — promote someone else first.");

  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");

  return ok("Account removed.");
}


export async function listUsers() {
  await requireAdmin();
  return db.select().from(users).orderBy(sql`lower(${users.name})`);
}
