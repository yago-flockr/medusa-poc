import { defineConfig } from "eslint/config"
import rootConfig from "../eslint.config.mjs"

export default defineConfig([
  ...rootConfig,
  {
    // A thrown Error here fails the test run; it never maps to an HTTP status.
    rules: {
      "@medusajs/use-medusa-error-not-generic-error": "off",
    },
  },
  { ignores: ["test-results/**", "playwright-report/**"] },
])
