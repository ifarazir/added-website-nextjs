import "server-only";

import { eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";

import { db } from "@/db";
import { users } from "@/db/schema";

import { SESSION_COOKIE, type SessionPayload, signSession, verifySession } from "./session";

export { hashPassword, verifyPassword } from "./password";

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = lower(${email})`)
    .limit(1);
  return user ?? null;
}

export async function createSession(payload: SessionPayload) {
  const token = await signSession(payload);
  const jar = await cookies();

  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, payload.sub));
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** The signed-in admin, or null. Safe to call from any server component. */
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = await verifySession(token);
  if (!payload) return null;

  const [user] = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
  return user ?? null;
}

/** Use inside admin server actions — throws rather than silently no-opping. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated.");
  return user;
}

/**
 * Guards the actions only an admin may run — everything under Users. Editors
 * keep full control of the catalogue; they just cannot grant or revoke access.
 */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Error("This action needs an admin account.");
  return user;
}
