import { defineConfig } from "eslint/config"
import medusa from "@medusajs/eslint-plugin"
import prettier from "eslint-config-prettier"

export default defineConfig([
  {
    ignores: ["src/lib/generated/**"],
  },
  ...medusa.configs.recommended,
  prettier,
])
