/**
 * One command to make a fresh deployment usable: apply migrations, then seed
 * the catalogue only if it is still empty.
 *
 * Safe to run on every build. Migrations are idempotent, and the seed steps
 * aside once there is content, so a redeploy never overwrites what the studio
 * has edited.
 */
import "./load-env";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import { seed } from "./seed";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");

  const client = postgres(url, { max: 1 });
  await migrate(drizzle(client), { migrationsFolder: "./drizzle" });
  await client.end();
  console.log("✓ migrations applied");

  await seed({ ifEmpty: true });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
