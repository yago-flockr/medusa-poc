import { defineConfig, devices } from "@playwright/test"
import { readFileSync } from "node:fs"
import {
  BACKEND_DIR,
  BACKEND_PORT,
  BACKEND_URL,
  DATABASE_URL,
  DEFAULT_REGION,
  PUBLISHABLE_KEY_FILE,
  REDIS_URL,
  STOREFRONT_DIR,
  STOREFRONT_PORT,
  STOREFRONT_URL,
} from "./lib/e2e-config"

let publishableKey: string
try {
  publishableKey = readFileSync(PUBLISHABLE_KEY_FILE, "utf8").trim()
} catch {
  throw new Error("Run `pnpm e2e:prepare` before the tests")
}

const backendEnv = {
  DATABASE_URL,
  REDIS_URL,
  PORT: String(BACKEND_PORT),
  STORE_CORS: STOREFRONT_URL,
  ADMIN_CORS: BACKEND_URL,
  AUTH_CORS: `${BACKEND_URL},${STOREFRONT_URL}`,
  VENDOR_CORS: STOREFRONT_URL,
}

const storefrontEnv = {
  NEXT_PUBLIC_MEDUSA_BACKEND_URL: BACKEND_URL,
  NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY: publishableKey,
  NEXT_PUBLIC_DEFAULT_REGION: DEFAULT_REGION,
  NEXT_PUBLIC_BASE_URL: STOREFRONT_URL,
}

export default defineConfig({
  testDir: "./specs",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // One browser at a time: a Medusa server plus a Next dev server plus
  // parallel Chromium workers exhausts an 8GB machine.
  workers: 1,
  // A full purchase walks several checkout steps, each compiled on demand by
  // the dev server the first time it is hit.
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: STOREFRONT_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "pnpm exec medusa develop",
      cwd: BACKEND_DIR,
      url: `${BACKEND_URL}/health`,
      env: backendEnv,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      stdout: "ignore",
      stderr: "pipe",
    },
    {
      command: `pnpm exec next dev -p ${STOREFRONT_PORT}`,
      cwd: STOREFRONT_DIR,
      url: STOREFRONT_URL,
      env: storefrontEnv,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
      stdout: "ignore",
      stderr: "pipe",
    },
  ],
})
