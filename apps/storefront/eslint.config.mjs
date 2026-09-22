import { FlatCompat } from "@eslint/eslintrc"
import { dirname } from "path"
import { fileURLToPath } from "url"

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

export default [
  {
    ignores: [".next/**", "node_modules/**", ".open-next/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),
  {
    files: ["*.js"],
    languageOptions: { sourceType: "commonjs" },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["src/vendor/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/store/*",
                "**/store/*",
                "**/store",
                "@/affiliate/*",
                "**/affiliate/*",
                "**/affiliate",
              ],
              message:
                "vendor/ must never import from store/ or affiliate/ — these are isolated actor boundaries.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/affiliate/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/store/*",
                "**/store/*",
                "**/store",
                "@/vendor/*",
                "**/vendor/*",
                "**/vendor",
              ],
              message:
                "affiliate/ must never import from store/ or vendor/ — these are isolated actor boundaries.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/store/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/vendor/*",
                "**/vendor/*",
                "**/vendor",
                "@/affiliate/*",
                "**/affiliate/*",
                "**/affiliate",
              ],
              message:
                "store/ must never import from vendor/ or affiliate/ — these are isolated actor boundaries.",
            },
          ],
        },
      ],
    },
  },
]
