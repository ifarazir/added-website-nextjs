/**
 * Entry point for `npm run db:seed`. The seeding itself lives in seed.ts, which
 * has no side effects on import so setup.ts can call it after migrating.
 *
 * Pass --if-empty to leave an already-populated catalogue alone.
 */
import "./load-env";

import { seed } from "./seed";

seed({ ifEmpty: process.argv.includes("--if-empty") }).catch((err) => {
  console.error(err);
  process.exit(1);
});
