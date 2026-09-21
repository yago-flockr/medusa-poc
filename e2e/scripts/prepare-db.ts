import { execFileSync } from "node:child_process"
import { writeFileSync } from "node:fs"
import { Client } from "pg"
import {
  BACKEND_DIR,
  DATABASE_URL,
  PUBLISHABLE_KEY_FILE,
  REDIS_URL,
} from "../lib/e2e-config"

const backendEnv = {
  ...process.env,
  DATABASE_URL,
  REDIS_URL,
  NODE_ENV: "development",
}

function runInBackend(args: string[]) {
  execFileSync("pnpm", args, {
    cwd: BACKEND_DIR,
    env: backendEnv,
    stdio: "inherit",
  })
}

function databaseName() {
  return new URL(DATABASE_URL).pathname.replace(/^\//, "")
}

function maintenanceUrl() {
  const url = new URL(DATABASE_URL)
  url.pathname = "/postgres"
  return url.toString()
}

async function recreateDatabase() {
  const name = databaseName()
  const admin = new Client({ connectionString: maintenanceUrl() })
  await admin.connect()
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
    [name],
  )
  await admin.query(`DROP DATABASE IF EXISTS "${name}"`)
  await admin.query(`CREATE DATABASE "${name}"`)
  await admin.end()
}

async function readPublishableKey() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  const result = await client.query<{ token: string }>(
    `SELECT token FROM api_key WHERE type = 'publishable' AND revoked_at IS NULL ORDER BY created_at LIMIT 1`,
  )
  await client.end()

  const token = result.rows[0]?.token
  if (!token) {
    throw new Error(
      "No publishable API key found after seeding the e2e database",
    )
  }
  return token
}

async function main() {
  console.log(`[e2e] resetting ${databaseName()}`)
  await recreateDatabase()

  console.log("[e2e] migrating")
  runInBackend(["exec", "medusa", "db:migrate"])

  console.log("[e2e] seeding catalog")
  runInBackend(["run", "seed:catalog"])

  console.log("[e2e] seeding identity")
  runInBackend(["run", "seed:identity"])

  console.log("[e2e] seeding vendors")
  runInBackend(["run", "seed:vendors"])

  writeFileSync(PUBLISHABLE_KEY_FILE, await readPublishableKey())
  console.log("[e2e] ready")
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
