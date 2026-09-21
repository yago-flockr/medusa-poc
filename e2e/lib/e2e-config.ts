import { resolve } from "node:path"

export const BACKEND_PORT = 9100
export const STOREFRONT_PORT = 8100

export const BACKEND_URL = `http://localhost:${BACKEND_PORT}`
export const STOREFRONT_URL = `http://localhost:${STOREFRONT_PORT}`

export const DATABASE_URL = "postgres://medusa:medusa@localhost:5432/medusa_e2e"
export const REDIS_URL = "redis://localhost:6379"
export const DEFAULT_REGION = "gb"

const repoRoot = resolve(__dirname, "..", "..")

export const BACKEND_DIR = resolve(repoRoot, "apps", "backend")
export const STOREFRONT_DIR = resolve(repoRoot, "apps", "storefront")

// Written by scripts/prepare-db.ts, read by playwright.config.ts: the key
// only exists once the database has been seeded.
export const PUBLISHABLE_KEY_FILE = resolve(__dirname, "..", ".publishable-key")
