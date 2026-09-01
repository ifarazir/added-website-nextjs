import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: [".next/**", "node_modules/**", "drizzle/**", "next-env.d.ts", "design/**"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Unused args are fine when they document a signature (server actions
      // always receive the previous state, which most of them ignore).
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
];

export default config;
