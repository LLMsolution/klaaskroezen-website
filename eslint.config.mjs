import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    // Generated output + Next.js reference file — never lint.
    ignores: [".next/**", "next-env.d.ts", "convex/_generated/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Convex query/filter callbacks receive a builder object whose static
    // type is hard to express — downgrade no-explicit-any to warning for
    // backend code so it stays visible in PR diffs without blocking CI.
    files: ["convex/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
