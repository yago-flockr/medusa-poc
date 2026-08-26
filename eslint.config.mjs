import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"
import prettier from "eslint-config-prettier"

export default defineConfig([
  ...medusa.configs.recommended,
  prettier,
  {
    // packages/api-contracts is shared with apps/storefront, which has no
    // @medusajs/framework dependency, so it must import the bare `zod` package.
    files: ["packages/api-contracts/**/*.ts"],
    rules: {
      "@medusajs/zod-import-source": "off",
    },
  },
])
