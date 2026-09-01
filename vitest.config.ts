import path from "node:path";

import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": path.resolve(__dirname, "tests/stubs/server-only.ts"),
    },
  },
  test: {
    // Pure logic only — anything touching the database or the Next.js runtime
    // is covered by the Playwright suite instead.
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
});
