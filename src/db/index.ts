import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and point it at your PostgreSQL instance.",
  );
}

// Next.js keeps modules alive across hot reloads in dev, so the client is
// cached on globalThis to avoid opening a new pool on every edit.
const globalForDb = globalThis as unknown as { __addedSql?: ReturnType<typeof postgres> };

const client =
  globalForDb.__addedSql ??
  postgres(connectionString, {
    max: process.env.NODE_ENV === "production" ? 10 : 3,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") globalForDb.__addedSql = client;

export const db = drizzle(client, { schema, casing: "snake_case" });
export { schema };
