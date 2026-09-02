// Playwright's own process does not load .env — Next.js does that for the app.
import "../../scripts/load-env";

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

/**
 * Removes anything the suite created.
 *
 * Each test already deletes what it made, but only on the happy path — a test
 * that fails half way leaves its rows behind, and they then show up in later
 * runs (a stray "Test Object" turning up in real search results is how this was
 * noticed). Everything the suite creates is named through `unique()`, so the
 * timestamp suffix is enough to find it again.
 */
const TEST_SUFFIX = "-mt[a-z0-9]{5,}-[0-9]{1,5}$";

export default async function globalTeardown() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("global teardown: DATABASE_URL is not set, leaving test rows in place");
    return;
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client);

  try {
    await db.execute(sql`delete from products where slug ~ ${TEST_SUFFIX}`);
    await db.execute(sql`delete from categories where slug ~ ${TEST_SUFFIX}`);
    await db.execute(
      sql`delete from users where email ~ ${TEST_SUFFIX.replace("$", "@addedforms\\.com$")}`,
    );
    await db.execute(sql`delete from subscribers where email like 'e2e-%@example.com'`);
    await db.execute(sql`delete from media_assets where filename like 'e2e-upload-%'`);
  } finally {
    await client.end();
  }
}
